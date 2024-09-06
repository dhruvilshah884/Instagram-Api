const express = require('express')
const router = express.Router()
const UserController = require('../controller/UserController')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "Profile_Image") {
      cb(null, "uploads/Profile_Image/");
    } else if (file.fieldname === "UserPost") {
      cb(null, "uploads/UserPost/");
    } else {
      cb(null, "uploads/");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
// get method
router.get('/',UserController.Home);
router.get('/users',UserController.Users)
// post method
router.post('/Register', upload.single('Profile_Image'), UserController.Register);
router.post('/Login',UserController.Login);
router.post('/Profile',UserController.Profile);
router.post('/Photo',upload.single('UserPost'),UserController.Photo);
router.post('/Follwers/:id',UserController.Follwers);
router.post('/Unfollow/:id',UserController.UnFollow);
router.post('/Add-Like/:photoId',UserController.addLike);
router.post('/Add-Comment/:id',UserController.addComment);
router.post('/Add-Message',UserController.AddMessage)
// put method
router.put('/Update-Register/:id',upload.single('Profile_Image'),UserController.UpdateRegister);
router.put('/Update-Photo/:id',upload.single('UserPost'),UserController.UpdatePhoto);
// delete method
router.delete('/Delete-Photo',UserController.DeletePhoto)
module.exports = router