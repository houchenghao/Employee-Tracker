const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');

async function connQuery (sql) {
  const connection = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password here
      password: '!Hch359610',
      database: 'employee_db'
    },
  );
    const conn = await connection;
    return await conn.query(sql);
}

async function init (){
  const answer = await inquirer.prompt([
    {
      type:'list',
      name:'whatToDo',
      message:'what would you like to do?',
      choices:[
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a department',
        'Add a role',
        'Add an Employee',
        'Update an employee role',
        'Update employee managers',
        'View employees by manager',
        'View employees by department',
        'Delete department',
        'Delete role',
        'Delete employee',
        'Department salaries'
      ],
    }]
  )
  
  if(answer.whatToDo === 'View All Departments'){
    const sql = `SELECT * FROM department;`;
    const [rows] = await connQuery(sql);
    console.table(rows);
    init();
  }

  if(answer.whatToDo === 'View All Roles'){
    const sql = `SELECT role.title AS "job title", role.id AS "role id", department.name AS "department name", role.salary AS "salary"
              FROM role 
              LEFT JOIN department ON role.department_id = department.id
              ORDER BY role.id`;
    
    const [rows] = await connQuery(sql);
    console.table(rows);
    init();
  }

  if(answer.whatToDo === 'View All Employees'){
    const sql = `SELECT a.id, a.first_name AS "first name", a.last_name AS "last name", role.title AS "role title", role.salary AS "salary", department.name AS department, CONCAT(b.first_name, \' \', b.last_name,\' \') AS manager
            FROM employee AS a
            JOIN role ON a.role_id = role.id
            lEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee AS b ON a.manager_id = b.id
            ORDER BY a.id
            `;

    const [rows] = await connQuery(sql);
    console.table(rows);
    init();
  }

  if(answer.whatToDo === 'Add a department'){
    const answer = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message:'enter the name of the department'
    }]);

    const sql = `INSERT INTO department(name) VALUES(\"${answer.name}\")`;
    await connQuery(sql);
    init();
  }

  if(answer.whatToDo === 'Add a role'){
    const Dsql = `SELECT * FROM department;`;
    const [rows] = await connQuery(Dsql);
    const departments =[];
    for(let i = 0; i<rows.length;i++){
      departments.push(rows[i].name);
    }

    const answer = await inquirer.prompt([{
      type:'input',
      name:'title',
      message:'enter the title'
    },
    {
      type: 'input',
      name:'salary',
      message:'enter the salary'
    },
    {
      type: 'list',
      name:'department',
      message:'enter the department',
      choices: departments,
    }
    ])
    
    var departmentId = 0;        
    for(let i = 0; i<rows.length;i++){
      if(answer.department === rows[i].name){
        departmentId = rows[i].id;
        break;
      }
    }

    const sql = `INSERT INTO role(title,salary,department_id) VALUES(\"${answer.title}\",${answer.salary},${departmentId});`;
    await connQuery(sql);
    init();

  }

  if(answer.whatToDo === 'Add an Employee'){
    
    const roleSql = `SELECT title,id FROM role;`;
    const [rowsRole] = await connQuery(roleSql);
    const roles =[];
    for(let i = 0; i<rowsRole.length;i++){
      roles.push(rowsRole[i].title);
    };

    const employeeSql = `SELECT CONCAT(first_name, \' \', last_name,\' \')AS name, id FROM employee`;
    const [rowsEmployee] = await connQuery(employeeSql);
    const employee = ['none'];
    for(let i = 0; i<rowsEmployee.length;i++){
      employee.push(rowsEmployee[i].name);
    };
    
    const answer = await inquirer.prompt([{
      type: 'input',
      name:'first_name',
      message:'enter the first name'
    },
    {
      type: 'input',
      name:'last_name',
      message:'enter the last name'
    },
    {
      type: 'list',
      name:'role',
      message:'select the role',
      choices: roles
    },
    {
      type: 'list',
      name:'manager',
      message:'select the manager',
      choices: employee
    },
    ])
    var roleID = 0;        
    for(let i = 0; i<rowsRole.length;i++){
      if(answer.role === rowsRole[i].title){
        roleID = rowsRole[i].id;
        break;
      }
    }

    var managerID = 0;        
    for(let i = 0; i<rowsEmployee.length;i++){
      if(answer.manager === rowsEmployee[i].name){
        managerID = rowsEmployee[i].id;
        break;
      }else{
        managerID = null;
      }
    }
    const sql = `INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES(\"${answer.first_name}\", \"${answer.last_name}\", ${roleID}, ${managerID});`;
    await connQuery(sql);
    init();
  }

  if(answer.whatToDo === 'Update an employee role'){

    const employeeSql = `SELECT CONCAT(first_name, \' \', last_name,\' \')AS name, id FROM employee`;
    const [rowsEmployee] = await connQuery(employeeSql);
    const employee = [];
    for(let i = 0; i<rowsEmployee.length;i++){
      employee.push(rowsEmployee[i].name);
    };

    const roleSql = `SELECT id, title FROM role`;
    const [rowsroles] = await connQuery(roleSql);
    const roles = [];
    

    for(let i = 0; i<rowsroles.length;i++){
      roles.push(rowsroles[i].title);
    };


    const answer = await inquirer.prompt([
      {
        type: 'list',
        name:'employee',
        message:'select the employee',
        choices: employee
      },
      {
        type: 'list',
        name:'role',
        message:'select the role',
        choices: roles
      }
    ]);

    var roleID = 0;        
    for(let i = 0; i<rowsroles.length;i++){
      if(answer.role === rowsroles[i].title){
        roleID = rowsroles[i].id;
        break;
      }
    }
    var employeeID = 0;        
    for(let i = 0; i<rowsEmployee.length;i++){
      if(answer.employee === rowsEmployee[i].name){
        employeeID = rowsEmployee[i].id;
        break;
      }
    }
    sql = `UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID} `;
    await connQuery(sql);
    init();
  };

  if(answer.whatToDo === 'Update employee managers'){
    const employeeSql = `SELECT CONCAT(first_name, \' \', last_name)AS name, id FROM employee`;
    const [rowsEmployee] = await connQuery(employeeSql);
    const employee = [];
    const managers = ['none'];

    for(let i = 0; i<rowsEmployee.length;i++){
      employee.push(rowsEmployee[i].name);
      managers.push(rowsEmployee[i].name);
    };

    const employeeNewManager = await inquirer.prompt([
      {
        type: 'list',
        name:'employee',
        message:'select the the employee to change the manager',
        choices: employee
      }]);

    var employeeID = 0;        
    for(let i = 0; i<rowsEmployee.length;i++){
      if(employeeNewManager.employee === rowsEmployee[i].name){
        employeeID = rowsEmployee[i].id;
        break;
      }
    };

    const index = managers.indexOf(employeeNewManager.employee);
    managers.splice(index,1);

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name:'manager',
        message:'select manager for this employee',
        choices: managers
      }
    ]);

    var managerID = 0;        
    for(let i = 0; i<rowsEmployee.length;i++){
      if(answer.manager === rowsEmployee[i].name){
        managerID = rowsEmployee[i].id;
        break;
      }else{
        managerID = null;
      }
    };

    sql = `UPDATE employee SET manager_id = ${managerID} WHERE id = ${employeeID}`;
    await connQuery(sql);
    init();
  }

  if(answer.whatToDo === 'View employees by manager'){

    const sql = `SELECT a.id, CONCAT(b.first_name, \' \', b.last_name,\' \') AS manager
    FROM employee AS a
    JOIN employee AS b ON a.manager_id = b.id
    ORDER BY a.id
    `;

    const [rows] = await connQuery(sql);
    const managers = [];

    for(let i = 0; i<rows.length;i++){
      managers.push(rows[i].manager);
    };

    const uniqueManagers = [...new Set(managers)];
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name:'manager',
        message:'Which employee do you want to see direct reports for',
        choices: uniqueManagers
      }]);

    const sql2 = `SELECT a.id, a.first_name AS "first name", a.last_name AS "last name", role.title AS "role title", department.name AS department
    FROM employee AS a
    JOIN role ON a.role_id = role.id
    JOIN department ON role.department_id = department.id
    JOIN employee AS b ON a.manager_id = b.id
    WHERE CONCAT(b.first_name, \' \', b.last_name,\' \') = "${answer.manager}"
    ORDER BY a.id
    `;
    const [rows2] = await connQuery(sql2);
    console.table(rows2);
    init();
  };

  if(answer.whatToDo === 'View employees by department'){
    const sql = `SELECT name FROM department;`;
    const [rows] = await connQuery(sql);
    const departments = [];
    for (let i = 0; i<rows.length; i++){
      departments.push(rows[i].name);
    };

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name:'department',
        message:'Which department do you want to see the employees',
        choices: departments
      }]);

      const sql2 = `SELECT employee.id, employee.first_name AS "first name", employee.last_name AS "last name", role.title AS "role title"
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
      WHERE department.name = "${answer.department}"
      ORDER BY employee.id
      `;

    const [rows2] = await connQuery(sql2);
    console.table(rows2);
    init();
  }

  if(answer.whatToDo === 'Delete department'){
    const getDepartmentNameSql = `SELECT name FROM department;`;
    const [rows] = await connQuery(getDepartmentNameSql);
    const departments = [];
    for (let i = 0; i<rows.length; i++){
      departments.push(rows[i].name);
    };
    
    const departmentToDelete = await inquirer.prompt([
      {
        type: 'list',
        name:'department',
        message:'select the department to delete',
        choices: departments
      }
    ]);

    deleteSql = `DELETE FROM department WHERE name = '${departmentToDelete.department}'`;
    await connQuery(deleteSql);

    init();
  };

  if(answer.whatToDo === 'Delete role'){

    const getRoleNameSql = `SELECT title FROM role;`;
    const [rows] = await connQuery(getRoleNameSql);
    const roles = [];
    for (let i = 0; i<rows.length; i++){
      roles.push(rows[i].title);
    };

    const roleToDelete = await inquirer.prompt([
      {
        type: 'list',
        name:'role',
        message:'select the role to delete',
        choices: roles
      }
    ]);
  
    deleteSql = `DELETE FROM role WHERE title = '${roleToDelete.role}'`;
    await connQuery(deleteSql);
    init();
  };

  if(answer.whatToDo === 'Delete employee'){

    const getemployeeNameSql = `SELECT CONCAT(first_name, \' \', last_name,\' \')AS name FROM employee`;
    const [rows] = await connQuery(getemployeeNameSql);
    const employees = [];
    for (let i = 0; i<rows.length; i++){
      employees.push(rows[i].name);
    };

    const employeeToDelete = await inquirer.prompt([
      {
        type: 'list',
        name:'employee',
        message:'select the employee to delete',
        choices: employees
      }
    ]);
  
    deleteSql = `DELETE FROM employee WHERE CONCAT(first_name, \' \', last_name,\' \') = '${employeeToDelete.employee}'`;
    await connQuery(deleteSql);
    init();
  };

  if(answer.whatToDo === 'Department salaries'){

    const getDepartmentNameSql = `SELECT name FROM department;`;
    const [rows] = await connQuery(getDepartmentNameSql);
    const departments = [];
    for (let i = 0; i<rows.length; i++){
      departments.push(rows[i].name);
    };
    const departmentsalery = await inquirer.prompt([
      {
        type: 'list',
        name:'department',
        message:'select the department salaries to view',
        choices: departments
      }
    ]);

    const sql2 = `SELECT department.name AS "department", SUM(role.salary) AS "Total Salary"
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    WHERE department.name = "${departmentsalery.department}"
    `;
    const [rows2] = await connQuery(sql2);
    console.table(rows2);
    init();
  }
}
init();