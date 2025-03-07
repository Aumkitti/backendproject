const express = require("express");
const router = express.Router();
const { 
    createAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
} = require ("../controllers/adminController");

router.post("/createAdmin",createAdmin)
router.get("/getAdmins",getAdmins);
router.get("/getAdminById/:admin_id",getAdminById);
router.put("/updateAdmin/:admin_id",updateAdmin);
router.delete("/deleteAdmin/:admin_id",deleteAdmin);

module.exports = router;