import  express from "express"
import HandleErrors from "../../middleware/handleErrors"
import { CreateRole, GetAllRoles, GetRoleById, UpdateRole } from "./controllers"
import { verifyToken, checkPermission } from "../../middleware/authMiddleware";
import { CREATE_ROLE_PERMISSIONS, GET_ROLE_PERMISSIONS, UPDATE_ROLE_PERMISSIONS } from "../../utils/CommonConstants";
const RoleRouter=express.Router()


RoleRouter.post('/create', verifyToken ,checkPermission(CREATE_ROLE_PERMISSIONS), HandleErrors(CreateRole))
RoleRouter.get('/get-all-roles', verifyToken,checkPermission(GET_ROLE_PERMISSIONS), HandleErrors(GetAllRoles))
RoleRouter.get('/get-role/:roleId', verifyToken,checkPermission(GET_ROLE_PERMISSIONS), HandleErrors(GetRoleById))
RoleRouter.put('/update-role/:roleId', verifyToken,checkPermission(UPDATE_ROLE_PERMISSIONS), HandleErrors(UpdateRole))

export default RoleRouter;


