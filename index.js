import express from "express";
import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();

const app= express();
app.use(express.json());
const porta = 3000;


app.post('/order', async (req,res) => { 
    try{

        const novoPedido = await prisma.order.create({
            data: {
              orderId: req.body.numeroPedido,
              value: req.body.valorTotal,  
              creationDate: req.body.dataCriacao,
              Items: {
                create: {
                  productId: req.body.idItem, 
                  quantity: req.body.quantidadeItem,  
                  price: req.body.valorItem
                }
              }
            },
            include: {
              items: true 
            }
          });


        // await prisma.order.create({
        //     data:{
        //         orderId: req.body.numeroPedido,
        //         value: req.body.valorTotal,
        //         creationDate: req.body.dataCriacao               
        //     }
        // })

        res.send('OK')
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