const express = require('express');
const { getProfiles, createProfile, updateProfile, deleteProfile, getProfile, getProfilesByUser } = require("../controllers/profileController")

const router = express.Router()

router.get('/profile/getprofile/:id', getProfile)
router.get('/profile/getprofiles', getProfiles)
router.get('/profile/getprofilebyuser/', getProfilesByUser)
router.post('/profile/create', createProfile)
router.patch('/profile/update/:id', updateProfile)
router.delete('/profile/delete/:id', deleteProfile)


module.exports = router;