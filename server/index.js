const express = require('express');
const cors = require('cors')
const app = express()
const pool = require('./database/db')
const { getJoyas, getFilteredJoyas } = require('./consultas')

app.use(express.json())
app.use(cors())

const PORT = 3000

const reporte = async (req, res, next) => {
    console.log(req.method + " " + req.url + " En la fecha " + new Date().toLocaleString());
    next()
}

app.use(reporte);

app.listen(PORT, () => {
    console.log("Servidor encendido en el puerto " + PORT)
});

app.get('/joyas', async (req, res) => {
    try {
        let queryLimit = req.query
        const result = await getJoyas(queryLimit)
        res.json(result)
    } catch (error) {
        console.error("Error en la consulta GET /joyas: " + error)
        res.status(500).json({
            error: error.code,
            message: error.message
        })
    }
});

app.get("/joyas/filter", async (req, res) => {
    try {
        const result = await getFilteredJoyas(req.query)
        res.json(result)
    } catch (error) {
        console.error("Error en la consulta GET /joyas/filter: " + error)
        res.status(500).json({
            error: error.code,
            message: error.message
        })
    }
});

app.get("/joyas/:id", async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query("SELECT * FROM inventario WHERE id = $1", [id])
        res.json(result.rows)
    } catch (error) {
        console.error("Error en la consulta GET /joyas/:id: " + error)
        res.status(500).json({
            error: error.code,
            message: error.message
        })
    }
    
});

app.post('/joyas', async (req, res) => {
    try {
        const { nombre, categoria, metal, precio, stock } = req.body
        const values = [nombre, categoria, metal, precio, stock]
        const result = await pool.query("INSERT INTO inventario (nombre, categoria, metal, precio, stock) VALUES ($1, $2, $3, $4, $5)", values)

        res.send("Producto agregado con éxito")

    } catch (error) {
        console.error("Error en la consulta POST /joyas: " + error)
        res.status(500).json({
            error: error.code,
            message: error.message
        })
    }
});

app.put('/joyas/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { nombre, categoria, metal, precio, stock } = req.body
        const values = [nombre, categoria, metal, precio, stock, id]

        const result = await pool.query("UPDATE inventario SET nombre = $1, categoria = $2, metal = $3, precio = $4, stock = $5 WHERE id = $6", values)

        res.send("Producto actualizado con éxito")
    } catch (error) {
        console.error("Error en la consulta PUT /items: " + error)
        res.status(500).json({
            error: error.code,
            message: error.message
        })
    }
    
});

app.delete('/joyas/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query("DELETE FROM inventario WHERE id = $1", [id])
        res.send("Producto eliminado con éxito")

    } catch (error) {
        console.error("Error en la consulta DELETE /joyas: " + error)
        res.status(500).json({
            error: error.code,
            message: error.message
        })
    }
})