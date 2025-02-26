import User from '../models/usersModel.js';
export const userList = async (req, res) => {

   const users = await User.find({ isAdmin: false });
   return res.status(200).json({ success: true, users });

}

export const status = async (req, res) => {
    
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if(user.verified === true){
        user.verified = false;
    }else{
        user.verified = true;
    }
     
    user.save();
    
    return res.status(200).json(user); // Send the user data as a response
 
}