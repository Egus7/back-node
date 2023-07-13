const express = require('express');
const bodyParse = require('body-parser');
const cors = require('cors');
const port = require('./port');
const app = express();

//prueba
const { clientMarket } = require('./database');

app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());
app.use(cors());

//Hola mundo en el servidor de bienvenida 
app.get('/', (req, res) => {
    res.send('Hola mundo es una API Rest de mmarketdemo');
});

// obtener los datos de los usuarios
app.get('/minimarketdemoWeb/apirest/seguridades/usuarios', (req, res) => {

    clientMarket.query('SELECT * FROM seg_usuario ORDER BY id_seg_usuario')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un usuario
app.get('/minimarketdemoWeb/apirest/seguridades/usuarios/:id', (req, res) => {
    const { id } = req.params;

    clientMarket.query(`SELECT * FROM seg_usuario WHERE id_seg_usuario = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// para insertar un usuario
app.post('/minimarketdemoWeb/apirest/seguridades/usuarios', (req, res) => {
    const {codigo, apellidos, nombres, correo, clave, activo} = req.body;

    const query = `INSERT INTO seg_usuario (codigo, apellidos, nombres, correo, clave, activo) 
                    VALUES ($1, $2, $3, $4, $5, $6)`;
    const values = [codigo, apellidos, nombres, correo, clave, activo];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).send('Usuario agregado');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al agregar usuario');
        });
});

// para actualizar un usuario
app.put('/minimarketdemoWeb/apirest/seguridades/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const {codigo, apellidos, nombres, correo, clave, activo} = req.body;

    const query = `UPDATE seg_usuario SET codigo = $1, apellidos = $2, nombres = $3, correo = $4, clave = $5, 
                                        activo = $6 WHERE id_seg_usuario = '${id}'`;
    const values = [codigo, apellidos, nombres, correo, clave, activo];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).send('Usuario actualizado');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al actualizar usuario');
        });
});

// para eliminar un usuario
app.delete('/minimarketdemoWeb/apirest/seguridades/usuarios/:id', (req, res) => {
    const { id } = req.params;
    
    clientMarket.query(`DELETE FROM seg_usuario WHERE id_seg_usuario = '${id}'`)
        .then(() => {
            res.status(201).send('Usuario eliminado');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al eliminar usuario');
        });
});

// obtener los datos de los seg_modulos
app.get('/minimarketdemoWeb/apirest/seguridades/modulos', (req, res) => {

    clientMarket.query('SELECT * FROM seg_modulo ORDER BY id_seg_modulo')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un seg_modulo
app.get('/minimarketdemoWeb/apirest/seguridades/modulos/:id', (req, res) => {

    const { id } = req.params;

    clientMarket.query(`SELECT * FROM seg_modulo WHERE id_seg_modulo = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de los seg_perfil
app.get('/minimarketdemoWeb/apirest/seguridades/perfiles', (req, res) => {

    clientMarket.query('SELECT * FROM seg_perfil ORDER BY id_seg_perfil')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un seg_perfil
app.get('/minimarketdemoWeb/apirest/seguridades/perfiles/:id', (req, res) => {

    const { id } = req.params;

    clientMarket.query(`SELECT * FROM seg_perfil WHERE id_seg_perfil = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de los seg_asignaciones
app.get('/minimarketdemoWeb/apirest/seguridades/asignaciones', (req, res) => {

    clientMarket.query('SELECT * FROM seg_asignacion ORDER BY id_seg_asignacion')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un seg_asignacion
app.get('/minimarketdemoWeb/apirest/seguridades/asignaciones/:id', (req, res) => {

    const { id } = req.params;

    clientMarket.query(`SELECT * FROM seg_asignacion WHERE id_seg_asignacion = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// para insertar una nueva asignacion
app.post('/minimarketdemoWeb/apirest/seguridades/asignaciones', (req, res) => {
    
    const {id_seg_usuario, id_seg_perfil} = req.body;

    const query = `INSERT INTO seg_asignacion (id_seg_usuario, id_seg_perfil) 
                    VALUES ($1, $2)`;
    const values = [id_seg_usuario, id_seg_perfil];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).send('Asignacion agregada');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al agregar la asignacion');
        });
});

// para actualizar una nueva asignacion
app.put('/minimarketdemoWeb/apirest/seguridades/asignaciones/:id', (req, res) => {
    const { id } = req.params;
    const {id_seg_usuario, id_seg_perfil} = req.body;

    const query = `UPDATE seg_asignacion SET id_seg_usuario = $1, id_seg_perfil = $2 
                        WHERE id_seg_asignacion = '${id}'`;
    const values = [id_seg_usuario, id_seg_perfil];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).send('Asignacion actualizada');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al actualizar la asignacion');
        });
});

// para eliminar una asignacion
app.delete('/minimarketdemoWeb/apirest/seguridades/asignaciones/:id', (req, res) => {
    const { id } = req.params;
    
    clientMarket.query(`DELETE FROM seg_asignacion WHERE id_seg_asignacion = '${id}'`)
        .then(() => {
            res.status(201).send('Asignacion eliminado');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al eliminar la asignacion');
        });
});

// obtener los datos de los pry_proyectos
app.get('/minimarketdemoWeb/apirest/proyectos', (req, res) => {

    clientMarket.query('SELECT * FROM pry_proyecto ORDER BY id_pry_proyecto')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un pry_proyecto
app.get('/minimarketdemoWeb/apirest/proyectos/:id', (req, res) => {

    const { id } = req.params;

    clientMarket.query(`SELECT * FROM pry_proyecto WHERE id_pry_proyecto = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// para insertar una nuevo proyecto
app.post('/minimarketdemoWeb/apirest/proyectos', (req, res) => {
    
    const {nombre, fecha_inicio, fecha_fin, estado, avance} = req.body;

    const query = `INSERT INTO pry_proyecto (nombre, fecha_inicio, fecha_fin, estado, avance) 
                    VALUES ($1, $2, $3, $4, $5)`;
    const values = [nombre, fecha_inicio, fecha_fin, estado, avance];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).send('Proyecto agregado');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al agregar el proyecto');
        });
});

// para actualizar una nuevo proyecto
app.put('/minimarketdemoWeb/apirest/proyectos/:id', (req, res) => {
    const { id } = req.params;
    const {nombre, fecha_inicio, fecha_fin, estado, avance} = req.body;

    const query = `UPDATE pry_proyecto SET nombre =$1, fecha_inicio = $2, fecha_fin = $3, estado = $4, 
                        avance = $5  WHERE id_pry_proyecto = '${id}'`;
    const values = [nombre, fecha_inicio, fecha_fin, estado, avance];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).send('Proyecto actualizado');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al actualizar el proyecto');
        });
});

// para eliminar un proyecto
app.delete('/minimarketdemoWeb/apirest/proyectos/:id', (req, res) => {
    const { id } = req.params;
    
    clientMarket.query(`DELETE FROM pry_proyecto WHERE id_pry_proyecto = '${id}'`)
        .then(() => {
            res.status(201).send('Proyecto eliminado');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error al eliminar el proyecto');
        });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto: http://localhost:${port}`);
});
