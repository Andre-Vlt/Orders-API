import pkg from "pg";

const {Pool} = pkg;

const pool = new Pool ({
    user: 'postgres',
    host: 'localhost',
    database: 'Pedidos',
    password: 'a',
    port: 5432
});

// module.exports = pool;

export default pool;