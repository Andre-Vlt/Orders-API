import express from "express";
import bodyParser from "body-parser";
import pool from "./banco.js";

const app= express();
const porta = 3000;

app.use(bodyParser.json());

app.post('/order', async (req,res) => {
    try{
        const {orderId, value, dataCriacao, idItem, quantity, price} = req.body; 
        const newPedido = await pool.query('INSERT INTO Order (orderId, value, creationDate) VALUES ($1, $2, $3) RETURNING *', [orderId, value, dataCriacao]);
        const newItem = await pool.query('INSERT INTO Items (productID, quantity, price)VALUES ($1, $2, $3) RETURNING *', [idItem, quantity, price]);

        res.json(newPedido.rows[0]);
        res.json(newItem.rows[0]);
    }
    catch (erro) {
        console.error(erro.message);
        res.status(500).send('Erro adicionando pedido');
    }
});

app.get('/order/list', async(req, res)=>{
    try{
        const todosPedidos = await pool.query('SELECT * FROM Order');
        res.json(todosPedidos.rows);
    }
    catch (erro){
        console.error(erro.message);
        res.status(500).send('Erro buscando pedidos');
    }
});

app.get('/order/:orderId', async (req, res) => {
    try{
    const {orderId} = req.params;
    const pedido = await pool.query('SELECT *FROM Order WHERE id = $1', [orderId]);
    if (pedido.rows.length === 0){
        return res.status(404).send('Pedido não encontrado');
    }
    res.json(pedido.rows[0]);
}
catch(erro){
    console.error(erro.message);
    res.status(500).send('Erro ao buscar pedido');
}
});

app.put('/order/:orderId', async (req, res)=> {
    try{
        const {orderId} = req.params;
        const {quantity, price} = req.body;
        const updateOrder = await pool.query('UPDATE Items SET quantity = $1, price = $2 WHERE orderID = $3', [quantity, price, orderId]);
        if (updateOrder.rows.length === 0){
            return res.status(404).send('Pedido não encontrado');
        }

        res.json(updateOrder.rows[0]);
        
    }catch(erro){
        console.error(erro.message);
        res.status(500).send('Erro ao atualizar pedido');
    }
});


app.delete('/order/:orderId', async (req, res) => {
    try{
        const {orderId} = req.params;
        const deleteOrder = await pool.query('DELETE FROM Order where orderId = $1 RETURNING *', [orderId]);

        if(deleteOrder.rows.length === 0){
            return res.status(404).send('Pedido não encontrado');
        }

        res.json(deleteOrder.rows[0]);
    }catch(erro){
        console.error(erro.message);
        res.status(500).send('Erro ao deletar pedido');
    }
});


app.listen(porta, ()=>{
    console.log(`Server running on port ${porta}`);
})