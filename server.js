const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');
const { default: Choice } = require('inquirer/lib/objects/choice');
const { default: Choices } = require('inquirer/lib/objects/choices');

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
    //console.log(`Connected to the employee_db database.`)
  );
    const conn = await connection;
    // const [rows] = await conn.query(sql);
    return await conn.query(sql);
    // console.log(rows);
    // console.table(rows);
    //init();

  // connection
  // .then((conn) =>
  //   conn.query(sql)
  // )
  // .then(([rows,field]) => {
  //   console.log('\n');
  //   //console.log(rows)
  //   //console.table(rows);
  //   const data = rows;
  //   // init();
  //   return data;
  // }
  // )
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
          'Add an Employee',
          'Update an employee role'
        ],
      }]
    )
    .then(async (answer) => {
      if(answer.whatToDo === 'View All Departments'){

        const sql = `SELECT * FROM department;`;
        
        const [rows] = await connQuery(sql);
        console.table(rows);
        init();
      }

      if(answer.whatToDo === 'View All Roles'){
        const sql = `SELECT role.title AS "job title", role.id AS "role id", department.name AS "department name", role.salary AS "salary"
                  FROM role 
                  JOIN department ON role.department_id = department.id
                  ORDER BY role.id`;
        
        const [rows] = await connQuery(sql);
        console.table(rows);
        init();
      }

      if(answer.whatToDo === 'View All Employees'){
        const sql = `SELECT a.id, a.first_name AS "first name", a.last_name AS "last name", role.title AS "role title", role.salary AS "salary", department.name AS department, CONCAT(b.first_name, \' \', b.last_name,\' \') AS manager
                FROM employee AS a
                JOIN role ON a.role_id = role.id
                JOIN department ON role.department_id = department.id
                LEFT JOIN employee AS b ON a.manager_id = b.id
                ORDER BY a.id
                `;
        const [rows] = await connQuery(sql);
        console.table(rows);
        init();
      }

      if(answer.whatToDo === 'Add a department'){
        // inquirer.prompt([{
        //   type: 'input',
        //   name:'name',
        //   message:'enter the name of the department'
        // }]).then((answer)=>{
        // const sql = `INSERT INTO department(name) VALUES(\"${answer.name}\");`;

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
            console.log(departmentId);
            break;
          }
        }

        const sql = `INSERT INTO role(title,salary,department_id) VALUES(\"${answer.title}\",${answer.salary},${departmentId});`;

        await connQuery(sql);
        init();

      }




      if(answer.whatToDo === 'Add and Employee'){
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
          type: 'input',
          name:'role_id',
          message:'enter the role id'
        },
        {
          type: 'input',
          name:'manager_id',
          message:'enter the manager id'
        },
        ])
        // .then((answer)=>{
        //console.log(answer)
        const sql = `INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES(\"${answer.first_name}\", \"${answer.last_name}\", ${answer.role_id}, ${answer.manager_id});`;

        console.table(connQuery(sql));
        init();
        // })
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
