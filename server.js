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
      console.log(`Connected to the employee_db database.`)
    );
    
    connection
    .then((conn) =>
      conn.query(sql)
    )
    .then(([rows,field]) =>
      console.table(rows)
    )
    

  }


inquirer
  .prompt([
    {
      type:'list',
      message:'what would you like to do?',
      name:'whatToDo',
      choices:['View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a department',
        'Add a role',
        'Add and Employee',
        'Update an employee role' 
    ]
    }
  ])
  .then((answer) => {
    if(answer.whatToDo === 'View All Departments'){

      const sql = 'SELECT * FROM department';
      connQuery(sql);

      // connection
      //   .then((conn) =>
      //     conn.query(sql)
      //   )
      //   .then(([rows,field]) =>
      //     console.table(rows)
      //   )
    }
    if(answer.whatToDo === 'View All Roles'){
      const sql = 'SELECT * FROM role';
      connQuery(sql);
    }

  })

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
