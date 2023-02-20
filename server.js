const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

// const connection = mysql.createConnection(
//     {
//       host: 'localhost',
//       // MySQL username,
//       user: 'root',
//       // MySQL password here
//       password: '!Hch359610',
//       database: 'employee_db'
//     },
//     console.log(`Connected to the employee_db database.`)
//   );

function connQuery (sql){
  const connection = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password here
      password: '!Hch359610',
      database: 'employee_db'
    },
    //console.log(`Connected to the employee_db database.`)
  );
  
  connection
  .then((conn) =>
    conn.query(sql)
  )
  .then(([rows,field]) => {
    console.log('\n');
    console.table(rows);
    init();
  }
  )
}

function init (){
  inquirer
    .prompt([
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
          'Add and Employee',
          'Update an employee role'
        ],
      }]
    )
    .then((answer) => {
      if(answer.whatToDo === 'View All Departments'){

        const sql = `SELECT * FROM department;`;
        connQuery(sql);
      }
      if(answer.whatToDo === 'View All Roles'){
        const sql = `SELECT role.title AS job_title, role.id AS role_id, department.name AS department_name, role.salary FROM role INNER JOIN department ON role.department_id = department.id;`;
        connQuery(sql);
      }

      if(answer.whatToDo === 'View All Employees'){
        const sql = `SELECT a.id, a.first_name, a.last_name, role.title, role.salary, department.name AS department, CONCAT(b.first_name, \' \', b.last_name,\' \') AS manager
                FROM employee AS a
                JOIN role ON a.role_id = role.id
                JOIN department ON role.department_id = department.id
                LEFT JOIN employee AS b ON a.manager_id = b.id
                ORDER BY a.id
                `
        connQuery(sql);
      }

    })

}

init();
  

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
