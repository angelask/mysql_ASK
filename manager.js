const inquirer = require("inquirer")
const asciiart = require("asciiart-logo")
const mysql = require("mysql")

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lauren_12',
    database: 'roster_db'
});

// Turn into a promise returning an array

const generateEmployees = () => {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM employee", (err, results) => {
            employeeArray = []
            if (err) {
                return reject(err)
            };

            for (const result of results) {
                employeeArray.push(result.first_name + " " + result.last_name)
            }
            return resolve(employeeArray)
        })
    })
}

const generateDepts = () => {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM department", (err, results) => {
            deptArray = []
            if (err) {
                return reject(err)
            };

            for (const result of results) {
                deptArray.push(result.name)
            }
            return resolve(deptArray)
        })
    })
}

const generateDuties = () => {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM duties", (err, results) => {
            dutiesArray = []
            if (err) {
                return reject(err)
            };

            for (const result of results) {
                dutiesArray.push(result.title)
            }
            return resolve(dutiesArray)
        })
    })
}

const generateDeptID = (data) => {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM department", (err, results) => {
            let dept_id = 0
            if (err) {
                return reject(err)
            };

            for (const result of results) {
                if (result.name === data.department) {
                    dept_id = result.id
                }
            }
            return resolve(dept_id);
        })
    })
}

const generateDutiesID = (data) => {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM duties", (err, results) => {
            let duties_id = 0
            if (err) {
                return reject(err)
            }

            for (const result of results) {
                if (result.title === data.duties) {
                    duties_id = result.id
                }
            }
            return resolve(duties_id)
        })
    })
}
const addDepartment = (data) => {
    // function to add new department - COMPLETE
    console.log(data)
    connection.query(`INSERT INTO department(name) VALUES (?)`, [data.newdept], (err, results) => {
        if (err) throw err;
        console.log(`\nSuccessfully added ${data.newdept} to the directory.\n`)
        menuReturn();
    })
}

const addDepartmentQs = () => {
    // function to call up list of inquirer questions to add department - COMPLETE

    inquirer.prompt([
        {
            message: "What department would you like to add?",
            name: "newdept"
        },
    ]).then(function (response) {
        addDepartment(response)
    })
}

const addDuties = (data) => {
    // function to add new duty - COMPLETE
    let deptID
    connection.query("SELECT * FROM department", (err, results) => {
        if (err) throw err;
        for (const result of results) {
            if (result.name === data.whichdept) {
                deptID = result.id
            }
        }
    })
    connection.query(`INSERT INTO duties (title, salary, department, department_id) VALUES (?, ?, ?, ?)`, [data.title, data.salary, data.department, deptID], (err, results) => {
        if (err) throw err;
        console.log(`\nSuccessfully added ${data.title} to the duties directory.\n`)
        menuReturn();
    })
}

const addDutiesQs = async () => {
    // function to call up list of inquirer questions to add duty - COMPLETE
    let deptArray = await generateDepts();
    inquirer.prompt([
        {
            message: "Which department would you like to add a duties to?",
            name: "department",
            type: "list",
            choices: deptArray,
        },
        {
            message: "What duties would you like to add?",
            name: "title"
        },
        {
            message: "What salary would you like to attach to this duty?",
            name: "salary"

        }
    ]).then((response) => {
        addDuties(response);
    })
}

const addEmployee = async (data) => {
    // function to add new employee
    console.log(data)
    let dept_id = await generateDeptID(data)
    let duties_id = await generateDutiesID(data)
    connection.query(`INSERT INTO employee (first_name, last_name, duties, department, duties_id, department_id) VALUES (?, ?, ?, ?, ?, ?)`, [data.first_name, data.last_name, data.duties, data.department, duties_id, dept_id], (err, results) => {
        if (err) throw err;
        console.log(`\nSuccessfully added ${data.first_name} ${data.last_name} to the employee directory.\n`)
        menuReturn();
    })
}

const addEmployeeQs = async () => {
    // function to call of list of inquirer questions to add employee - COMPLETE
    let deptArray = await generateDepts()
    let DutiesArray = await generateDuties()
    inquirer.prompt([
        {
            message: "Into which department would you like to add this employee?",
            name: "department",
            type: "list",
            choices: deptArray
        },
        {
            message: "What is this employee's duties?",
            name: "duties",
            type: "list",
            choices: dutiesArray
        },
        {
            message: "Please provide employee's first name.",
            name: "first_name"
        },
        {
            message: "Please provide employee's last name.",
            name: "last_name"
        }
    ]).then((response) => {
        addEmployee(response)
    })
}

const updateEmployee = ((data, prevData) => {
    // function to update an employee    
    const name = prevData.employee.split(' ')
    const first_name = name[0]
    const last_name = name[1]
    if (!data.newduties) {
        connection.query("UPDATE employee SET department = ? WHERE first_name = ? AND last_name = ?", [data.newdepartment, first_name, last_name], (err, results) => {
            if (err) throw err;
            console.log(`\nSuccessfully updated ${prevData.employee}.\n`)
            menuReturn();
        })
    } else {
        connection.query("UPDATE employee SET duties = ? WHERE first_name = ? AND last_name = ?", [data.newduties, first_name, last_name], (err, results) => {
            if (err) throw err;
            console.log(`\nSuccessfully updated ${prevData.employee}.\n`)
            menuReturn();
        })
    }
})

const updateEmployeeQs = async () => {
    let employeeArray = await generateEmployees()
    let deptArray = await generateDepts()
    let dutiesArray = await generateDuties()
    inquirer.prompt([
        {
            message: "Which employee would you like to update?",
            name: "employee",
            type: "list",
            choices: employeeArray
        },
        {
            message: "What would you like to update?",
            name: "userchoice",
            type: "list",
            choices: ["Department", "duties"]
        },
    ]).then((response) => {
        let prevData = response
        if (response.userchoice === "Department") {
            inquirer.prompt([
                {
                    message: "What department would you like to assign?",
                    name: "newdepartment",
                    type: "list",
                    choices: deptArray
                }
            ]).then((response) => {
                updateEmployee(response, prevData)
            })
        } else {
            inquirer.prompt([
                {
                    message: "What duty would you like to assign?",
                    name: "newduties",
                    type: "list",
                    choices: dutiesArray
                }
            ]).then((response) => {
                updateEmployee(response, prevData)
            })
        }

    })
    // function to call list of inquirer questions to update employee
}

const viewDepartments = () => {
    // function to view a list of all departments
    connection.query("SELECT * FROM department", (err, results) => {
        if (err) throw err;
        console.log(`Current Department Listing:`)
        for (const result of results) {
            console.log(`${result.id} | ${result.name}`)
        }
        menuReturn();
    })
}

const viewDuties = () => {
    // funcion to view a list of all Duties
    connection.query("SELECT * FROM duties", (err, results) => {
        if (err) throw err;
        console.log(`Current duties Listing By Department:\n`)
        for (const result of results) {
            console.log(`${result.id} | ${result.title}`)
        }
        console.log(`\n`)
        menuReturn();
    })
}

const viewEmployees = () => {
    connection.query("SELECT * FROM employee", (err, results) => {
        if (err) throw err;
        console.log(`Current Employee Listing By Department:\n`)
        for (const result of results) {
            console.log(`${result.id} | ${result.first_name} ${result.last_name} | ${result.duties} | ${result.department}`)
        }
        console.log(`\n`)
        menuReturn();
    })
    // function to view a list of all employees
}

const menuReturn = () => {
    inquirer.prompt([
        {
            message: "Would you like to Return to Menu or Exit?",
            name: "menu",
            type: "list",
            choices: ["Return to Menu", "Exit"]
        }
    ]).then(function (response) {
        if (response.menu === "Return to Menu") {
            mainMenu();
        } else { exit() }
    })
}

const exit = () => {
    console.log(`Thank you for using our program today.`)
    connection.end();
}

const mainMenu = () => {
    console.log(`Please choose from the following options:`)
    inquirer.prompt([
        {
            message: "Please choose from the following options:",
            name: "userchoice",
            type: "rawlist",
            choices: ["View departments breakdown", "View duties breakdown", "View employee breakdown", "Add a department", "Add a duties", "Add an employee", "Update an employee", "Exit"]
        }
    ]).then(answers => {
        switch (answers.userchoice) {
            case "View departments breakdown":
                viewDepartments();
                break;
            case "View duties breakdown":
                viewDuties();
                break;
            case "View employee breakdown":
                viewEmployees();
                break;
            case "Add a department":
                addDepartmentQs();
                break;
            case "Add a duties":
                addDutiesQs();
                break;
            case "Add an employee":
                addEmployeeQs();
                break;
            case "Update an employee":
                updateEmployeeQs();
                break;
            case "Exit":
                exit();
                break;
            default:
                break;
        }
    })
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`Now connected as id ${connection.threadId}`)
    mainMenu();
})