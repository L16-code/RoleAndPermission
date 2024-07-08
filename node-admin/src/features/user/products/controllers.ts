import {Request,Response} from "express";
import UserProducts from "./service"
import { CustomRequest } from "../../../middleware/authMiddleware";
export const GetProducts = async (req:Request, res:Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await UserProducts.GetProducts({
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        })
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};
export const AddCart = async (req:Request, res:Response) => {
    try {
        const { product_id, user_id}=req.body
        const data = { product_id, user_id}
        const result = await UserProducts.AddCart(data)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};
export const GetCart = async (req:Request, res:Response) => {
    try {
        const result = await UserProducts.GetCart(req.params.id)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};
export const UpdateCart = async (req:Request, res:Response) => {
    try {
        const result = await UserProducts.UpdateCart(req.params.id,req.body)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};
export const DeleteCart = async (req:Request, res:Response) => {
    try {
        const result = await UserProducts.DeleteCart(req.params.id)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};
export const AddOrder = async (req:Request, res:Response) => {
    try {
        const result = await UserProducts.AddOrder(req.body)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};
export const GetOrder = async (req:Request, res:Response) => {
    try {
        const result = await UserProducts.GetOrder(req.params.id)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};
export const AddAddress = async (req:CustomRequest, res:Response) => {
    try {
        const id=req.UserId
        const result = await UserProducts.AddAddress(id as string ,req.body)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};
export const GetAllOrder = async (req:CustomRequest, res:Response) => {
    try {
        const id=req.UserId
        const result = await UserProducts.GetAllOrder(id as string)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
};