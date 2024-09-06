const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

exports.Home = (req, res) => {
  res.status(201).json({ message: "Welcome To Instagram" });
};

exports.Register = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let Profile_Image = req.file.filename;

    const token = jwt.sign({ email }, "sekjbfskdfkhasld", { expiresIn: "1h" });

    let user = new UserModel({ name, email, password, Profile_Image, token });
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.Login = async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    // console.log(user)
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: "Password Not Matched" });
    }
    const token = jwt.sign({ email: user.email }, "sekjbfskdfkhasld", {
      expiresIn: "1h",
    });
    req.session.user = user;
    return res.status(201).json({ message: "Login Successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.Profile = async (req, res) => {
  try {
    let user = await UserModel.findById(req.session.user._id);
    if (!user) {
      res.status(401).json({ message: "User Not Found Please Login First" });
    }
    // console.log(user)
    let { bio, username, gender } = req.body;

    user.bio = bio;
    user.username = username;
    user.gender = gender;
    await user.save();
    res.status(201).json({ message: "Profile Updated Successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.Photo = async (req, res) => {
  try {
    let UserPost = req.file.filename;
    let user = await UserModel.findById(req.session.user._id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User Not Found Please Login First" });
    }
    await user.photoes.push({ UserPost });
    await user.save();
    return res.status(201).json({ message: "Photo Added Successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.UpdateRegister = async (req, res) => {
  try {
    let id = req.params.id;
    let { name, email, password } = req.body;
    let Profile_Image = req.file.filename;
    let user = await UserModel.findByIdAndUpdate(id, {
      name,
      email,
      password,
      Profile_Image,
    });
    await user.save();
    res.status(201).json({ message: "User Registration Update Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.UpdatePhoto = async (req, res) => {
  try {
    let id = req.params.id;
    let UserPost = req.file.filename;
    let user = await UserModel.findById(req.session.user._id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User Not Found Please Login First" });
    }

    let Photoes = user.photoes.id(id);
    Photoes.UserPost = UserPost;
    await user.save();
    res.status(201).json({ message: "User Photo Update SuccessFully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.DeletePhoto = async (req, res) => {
  try {
    const { UserId } = req.body;
    const user = await UserModel.findById(req.session.user._id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User Not Found. Please Login First" });
    }

    const photoIndex = user.photoes.findIndex(
      (photo) => photo._id.toString() === UserId
    );

    if (photoIndex === -1) {
      return res.status(404).json({ message: "Photo Not Found" });
    }

    user.photoes.splice(photoIndex, 1);
    await user.save();

    res.status(200).json({ message: "Photo Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.Users = async (req, res) => {
  try {
    let user = await UserModel.find({});
    if (!user) {
      res.status(401).json({ message: "User Not Found Please Login First" });
    }
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.Follwers = async (req, res) => {
  try {
    const id = req.params.id;
    const currentUser = await UserModel.findById(req.session.user._id);
    const userToFollow = await UserModel.findById(id);

    if (!currentUser) {
      return res.status(401).json({ message: "Please Login First" });
    }

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.followingList.includes(id)) {
      return res
        .status(400)
        .json({ message: "You are already following this person" });
    }

    currentUser.followingList.push(id);
    currentUser.Following += 1;
    userToFollow.followersList.push(currentUser._id);
    userToFollow.Followers += 1;

    await currentUser.save();
    await userToFollow.save();

    res.status(201).json({ message: "You are now following this person" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.UnFollow = async (req, res) => {
  try {
    let id = req.params.id;
    let currentUser = await UserModel.findById(req.session.user._id);
    let userToUnfollow = await UserModel.findById(id);

    if (!currentUser) {
      return res.status(401).json({ message: "Please Login First" });
    }

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.followingList.includes(id)) {
      return res
        .status(400)
        .json({ message: "You are not following this person" });
    }

    currentUser.followingList = currentUser.followingList.filter(
      (followingId) => followingId.toString() !== id
    );
    currentUser.Following -= 1;

    userToUnfollow.followersList = userToUnfollow.followersList.filter(
      (followerId) => followerId.toString() !== currentUser._id.toString()
    );
    userToUnfollow.Followers -= 1;

    await currentUser.save();
    await userToUnfollow.save();
    res.status(200).json({ message: "You have unfollowed this person" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addLike = async (req, res) => {
    try {
      const userId = req.session.user._id;
      const photoId = req.params.photoId;
      const user = await UserModel.findOne({ "photoes._id": photoId });
  
      if (!user) {
        return res.status(404).json({ message: "Photo not found" });
      }
  
      const photo = user.photoes.id(photoId);
  
      if (photo.likedBy.includes(userId)) {
        return res.status(400).json({ message: "You have already liked this photo" });
      }
  
      photo.likes += 1;
      photo.likedBy.push(userId);
  
      await user.save();
      res.status(200).json({ message: "Like added", photo });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.addComment = async(req,res)=>{
    try {
        let id = req.session.user._id;
        let photoId = req.params.id;
        let {comment} = req.body;

        const user = await UserModel.findOne({ "photoes._id": photoId })
        if (!user) {
            return res.status(404).json({ message: "Photo not found" });
          }
          const photo = user.photoes.id(photoId);
          photo.comments.push({comment,user:id});
          await user.save()
          return res.status(201).json({message:"Comment Addedd SuccessFully"})
    } catch (error) {
    res.status(500).json({ message: error.message });
        
    }
}
exports.AddMessage = async (req, res) => {
  try {
    let { senderId, receiverId, content } = req.body;

    let sender = await UserModel.findById(senderId);
    let receiver = await UserModel.findById(receiverId);

    if (!sender || !receiver) {
      throw new Error("User not found");
    }

    const newMessage = {
      sender: senderId,
      content,
      createdAt: new Date(),
    };

    
    let senderConversation = sender.conversations.find(convo =>
      convo.participants.includes(receiverId)
    );

    if (!senderConversation) {
      senderConversation = {
        participants: [senderId, receiverId],
        messages: [],
      };
      sender.conversations.push(senderConversation);
    }

 
    let receiverConversation = receiver.conversations.find(convo =>
      convo.participants.includes(senderId)
    );

    if (!receiverConversation) {
      receiverConversation = {
        participants: [senderId, receiverId],
        messages: [],
      };
      receiver.conversations.push(receiverConversation);
    }


    senderConversation.messages.push(newMessage);
    receiverConversation.messages.push(newMessage);

    await sender.save();
    await receiver.save();
    return res.status(201).json({ message: "Message added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

