import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
    async index (request: Request, response: Response) {
        const { cidade, uf, items } = request.query;

        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        const points = await knex('points')
        .join('point_items', 'points.id', '=', 'point_items.id_ponto')
        .whereIn('point_items.id_item', parsedItems)
        .where('points.cidade', String(cidade))
        .where('points.uf', String(uf))
        .distinct()
        .select('points.*');

        return response.json(points);
    }    

    async show (request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if(!point) {
            return response.status(400).json({ message: 'Point not found.' });
        }

        const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.id_item')
        .where('point_items.id_ponto', id)
        .select('items.titulo');

        return response.json({ point, items });
    }

    async create (request: Request, response: Response) {
        const { 
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            uf,
            items
        } = request.body;
    
        const trx = await knex.transaction();

        const point = {
            imagem: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=50',
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            uf 
        };
    
        const idsInseridos = await trx('points').insert(point);
    
        const id_ponto = idsInseridos[0];
    
        const pointItems = items.map((id_item: number) => {
            return {
                id_item,
                id_ponto,
            };
        });
     
        await trx('point_items').insert(pointItems);

        await trx.commit();
    
        return response.json({ 
            id: id_ponto,
            ... point, 
        });
    } 
}

export default PointsController;