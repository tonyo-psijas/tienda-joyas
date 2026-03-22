const pool = require("./database/db")
const format = require("pg-format")

const getJoyas = async ( { limit = 5, order_by = "id_ASC", page = 1 } ) => {
    try {
        const [nombre, orden] = order_by.split("_");
        const currentPage = Number(page);
        const safeLimit = Number(limit);
        const offset = safeLimit * (currentPage - 1);

        const formattedQuery = format("SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s", nombre, orden, safeLimit, offset)

        const result = await pool.query(formattedQuery);

        const resultTotal = await pool.query("SELECT * FROM inventario");

        const hateoas = result.rows.map((item) => {
            return {
                nombre: item.nombre,
                url: `http://localhost:3000/joyas/${item.id}`   
            }
        })

        return {
            total_items: resultTotal.rowCount,
            previous_page: currentPage > 1 ? `http://localhost:3000/joyas?limit=${safeLimit}&order_by=${order_by}&page=${currentPage-1}` : null,
            next_page: offset + safeLimit < resultTotal.rowCount ? `http://localhost:3000/joyas?limit=${safeLimit}&order_by=${order_by}&page=${currentPage+1}` : null,
            items: hateoas
        }

    } catch (error) {
        console.error("Error en la consulta GET /joyas: " + error)
        throw new Error(error.message)
    }
};

const getFilteredJoyas = async ({ precio_max, precio_min, categoria, metal }) => {
    let filtros = []
    if (precio_min) filtros.push(`precio >= ${precio_min}`);
    if (precio_max) filtros.push(`precio <= ${precio_max}`);
    
    if (categoria) filtros.push(`categoria = '${categoria}'`);
    if (metal) filtros.push(`metal = '${metal}'`)

    let consulta = "SELECT * FROM inventario"

    if (filtros.length > 0) {
        consulta += " WHERE " + filtros.join(" AND ")
    }

    const result = await pool.query(consulta)

    return result.rows
};


module.exports = {
    getJoyas,
    getFilteredJoyas
}