import mongoose from "mongoose";
import { ProductModal } from "../../admin/products/model";
import { QueryParams } from "../auth/interface";
import { IAddAddress, IAddCartData, IAddOrder } from "./interface";
import { CartModel } from "./modal/cartModal";
import { object } from "joi";
import { AddressModel } from "./modal/addressModal";
import { OrdersModel } from "./modal/OrderModel";
const response: {
    message: string;
    data?: unknown;
    success: boolean;
} = { message: "", success: false };
interface IQuantity {
    quantity: number;
}
class UserProducts {
    async GetProducts({ page, limit }: QueryParams) {
        try {
            const offset = (page - 1) * limit;
            const products = await ProductModal.aggregate([
                {
                    $lookup: {
                        from: "products_catgeories",
                        localField: "category_id",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        price: 1,
                        quantity: 1,
                        description: 1,
                        image: 1,
                        category: { $first: "$category.name" }
                    }
                }
            ]).skip(offset).limit(limit);
            const totalUsers = await ProductModal.countDocuments();
            return {
                success: true,
                message: "Products found",
                data: products,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
            }
        } catch (error) {
            response.success = false;
            response.message = "An error occurred while fetching products";
        }
        return response;
    }
    async AddCart(data: IAddCartData) {
        const { product_id, user_id } = data
        const product = await ProductModal.findById(product_id);
        if (!product) {
            throw new Error('Product not found');
        }
        const productPrice = product.price;
        const checkProduct = await CartModel.findOne({ product_id, user_id });
        if (checkProduct) {
            if (checkProduct.status === 'Pending') {
                // Increment the quantity and update the total price
                checkProduct.quantity += 1;
                checkProduct.total_price = checkProduct.quantity * productPrice;
                await checkProduct.save();
                response.success = true;
                response.message = "Product added to cart successfully";
                response.data = null;
            } else if (checkProduct.status === 'Purchased') {
                // Update the status to '0', set quantity to 1, and update the total price
                const newCart = new CartModel({
                    product_id,
                    user_id,
                    quantity: 1,
                    total_price: productPrice,
                    status: 'Pending'
                });
                await newCart.save();
                response.success = true;
                response.message = "Product added to cart successfully";
                response.data = null;
            } else if (checkProduct.status === 'deleted') {
                const newCart = new CartModel({
                    product_id,
                    user_id,
                    quantity: 1,
                    total_price: productPrice,
                    status: 'Pending'
                });
                await newCart.save();
                response.success = true;
                response.message = "Product added to cart successfully";
            }
        } else {
            // Create a new cart item
            const newCart = new CartModel({
                product_id,
                user_id,
                quantity: 1,
                total_price: productPrice,
                status: 'Pending'
            });
            await newCart.save();
            response.success = true;
            response.message = "Product added to cart successfully";
            response.data = null;
        }
        return response
    }
    async GetCart(user_id: string) {
        try {
            const cartItems = await CartModel.aggregate([
                {
                    $match: {
                        user_id: new mongoose.Types.ObjectId(user_id),
                        status: "Pending"
                    }
                }
            ]);
            const products = await Promise.all(cartItems.map(async (item) => {
                const product = await ProductModal.findById(item.product_id);
                if (product) {
                    return {
                        _id: item._id,
                        product_id: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: item.quantity,
                        total_price: item.total_price,
                        image: product.image
                    }
                }
            }));
            return {
                success: true,
                message: "Cart fetched successfully",
                data: products
            }
        } catch (error) {
            response.success = false;
            response.message = "An error occurred while fetching cart";
        }
        return response;
    }
    async UpdateCart(id: string, quantity: IQuantity) {
        try {
            const cartItem = await CartModel.findById(id);
            if (!cartItem) {
                response.message = 'Cart item not found';
                return response;
            }

            // Find the product price by product ID
            const product = await ProductModal.findById(cartItem.product_id);
            if (!product) {
                response.message = 'Product not found';
                return response;
            }

            cartItem.quantity = quantity.quantity;
            cartItem.total_price = quantity.quantity * product.price;
            await cartItem.save()

            response.success = true;
            response.message = "Cart updated successfully";
            response.data = cartItem;
        } catch (error: any) {
            response.success = false;
            response.message = error.message;;
        }
        return response;
    }
    async DeleteCart(id: string) {
        try {
            const cartItem = await CartModel.findByIdAndUpdate(id, { status: 'deleted' });
            if (!cartItem) {
                response.message = 'Cart item not found';
                return response;
            }
            response.success = true;
            response.message = "Cart item deleted successfully";
            response.data = null;
        } catch (error: any) {
            response.success = false;
            response.message = error.message;
        }
        return response;
    }
    async AddOrder(data: IAddOrder) {
        try {
            const { user_id, total_price } = data;
            const cartItems = await CartModel.aggregate([
                {
                    $match: {
                        user_id: new mongoose.Types.ObjectId(user_id),
                        status: "Pending"
                    }
                }, 
                {
                    $project: {
                        _id: 1
                    }
                }
            ]);
            const cart_ids= cartItems.map((cartItem=>{
                return cartItem._id.toString()
            }))
            const newOrder = new OrdersModel({
                user_id,
                total_price,
                status: "Pending",
                cart_id: cart_ids
            });
            await newOrder.save();
            await CartModel.updateMany(
                {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    status: 'Pending',
                },
                { $set: { status: 'Purchased' } }
            );
            response.success = true;
            response.message = "Order placed successfully";
            response.data = newOrder;
            return response;
        } catch (error) {
            response.success = false;
            response.message = "An error occurred while placing order";
            return response;
        }
    }
    async GetOrder(user_id: string) {
        try {
            const orders = await CartModel.aggregate([
                {
                    $match: {
                        user_id: new mongoose.Types.ObjectId(user_id),
                        status: "Pending"
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "product_id",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $unwind: {
                        path: "$product",
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $project: {
                        name: "$product.name",
                        image: "$product.image",
                        total_price: 1,
                        quantity: 1
                    }
                }
            ]);
            response.success = true;
            response.message = "Orders fetched successfully";
            response.data = orders;

        }
        catch (err) {
            response.success = false;
            response.message = "An error occurred while fetching orders";
        }
        return response;
    }
    async AddAddress(id: string, data: IAddAddress) {
        try {
            const address = new AddressModel({
                user_id: id,
                city: data.city,
                state: data.state,
                pin: data.pin,
                house_no: data.house_no,
                isDefault: false,
            })
            const addressSaved = await address.save();
            if (!addressSaved) {
                response.success = false
                response.message = 'address not saved';
                return response;
            }
            response.success = true;
            response.message = "Address added successfully";
            response.data = null;
        } catch (error: any) {
            response.success = false;
            response.message = error.message;
        }
        return response;
    }
}
export default new UserProducts