import express from "express";
import { PrismaClient} from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();

const app= express();
app.use(express.json());
app.use(cors())
const porta = 3000;


app.post('/order', async (req,res) => { 
    try{

        const novoPedido = await prisma.order.create({
            data: {
              orderId: req.body.numeroPedido,
              value: req.body.valorTotal,  
              creationDate: req.body.dataCriacao,
              Items: {
                create: req.body.items.map(item => ({
                  productId: item.idItem,
                  quantity: item.quantidadeItem,
                  price: item.valorItem
                }))
              },
            }, include: {
                Items:true
            }
          });


        res.status(201).send({novoPedido})
    }
    catch (erro) {
        console.error(erro.message);
        res.status(500).send('Erro adicionando pedido');
    }
});

app.get('/order/list', async(req, res)=>{
    try{
       const orders = await prisma.order.findMany();
       res.json(orders); 
    }
    catch (erro){
        console.error(erro.message);
        res.status(404).send('Pedido não encontrado');
    }
});

app.get('/order/:orderId', async (req, res) => {
    try{
        const {orderId} = req.params;
        const order = await prisma.order.findUnique({
            where: {orderId: orderId},
            include:{Items:{} }
        });
        res.status(200).json(order);
}
catch(erro){
    console.error(erro.message);
    res.status(404).send('Pedido não encontrado');
}
});

app.put('/order/:orderId', async (req, res)=> {
    const {orderId} = req.params;
    const {value, itens, creationDate} = req.body;
    try{

        const UpdatedOrder = await prisma.order.update({
           where: {
            orderId: orderId
        },
           data:{
            value: value,
            creationDate: creationDate
           } 
        });
        
        res.json({pedido: UpdatedOrder});
        
        
    }catch(erro){
        console.error(erro.message);
        res.status(500).send('Erro ao atualizar pedido');
    }
});


app.delete('/order/:orderId', async (req, res) => {
    try{
        const {orderId} = req.params;
        await prisma.order.delete({
            where: {
                orderId: orderId
            }
        })

        res.json("Pedido deletado");
    }catch(erro){
        console.error(erro.message);
        res.status(500).send('Erro ao deletar pedido');
    }
});


app.listen(porta, ()=>{
    console.log(`Server running on port ${porta}`);
})