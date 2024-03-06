const express = require('express')
const router = express.Router();
const auth = require('../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const {check, validationResult} = require('express-validator');
const { profile } = require('console');
// GET api/profile/me
//get current user profile
router.get('/me',auth, async(req,res)=>{
    res.json(req.user)
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user',
        ['name', 'avatar'])

        if(!profile){
            return res.status(400).json({msg: "There is no profile for this user"})


        }

        res.json(profile);
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
});


//POST api/profile
//create/update user profile

router.post('/', [auth, [
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills are required').not().isEmpty()
]], async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,    
        twitter, 
        instagram,  
        linkedin  

    } = req.body

    //build profile object

    const profileFields = {}
    profileFields.user = req.user.id;
    if(company) profileFields.company= company;
    if(website)  profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername
    if(skills) {
        profileFields.skills= skills.split(',').map(skill=>skill.trim())
    }
    

    console.log(profileFields.skills)

    //social object
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube
    if(twitter) profileFields.social.twitter= twitter
    if(instagram) profileFields.social.instagram =  instagram
    if(linkedin) profileFields.social.linkedin = linkedin
    
    try {
        let profile =  await Profile.findOne({user: req.user.id})

        if(profile){
            //update
            profile = await Profile.findOneAndUpdate({user: req.user.id} ,
                 {$set:profileFields} ,
                 {new: true});
            
            return res.json(profile);
        }

        //create
        profile = new Profile(profileFields)
        await profile.save()
        return res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
    res.send(profileFields)
})



//get all profiles


router.get('/', async (req,res)=>{
    try {
        const profiles = await Profile.find().populate('user',
        ['name', 'avatar'])
        res.json(profiles)
    } catch (error) {

        console.error(error.message)
        res.status(500).send("Server error")
        
    }
})


//get api/profile/user/:user_id
 
router.get('/user/:user_id', async(req,res)=>{
    try{
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',
        ['name', 'avatar'])

        if(!profile){
            return res.status(400).json({msg: "Profile not found"})
        }

        res.json(profile)
    }catch(error){
        console.error(error.message)

        if(error.kind == 'ObjectId'){
            return res.status(400).json({msg: "Profile not found"})
        }
        res.status(500).send('Server error')
    }
});



//delete user
//delete api/profile                                    


router.delete('/',auth, async(req,res) =>{
    try {
        //remove profile
        await Profile.findOneAndDelete({user: req.user.id})
        await User.findOneAndDelete({ _id: req.user.id})
        res.json({msg: "user removed"})
    } catch (error) {
        console.error(error.message)
        res.status(500).send("server error")
    }
})


router.put("/addexperiences", [auth,[
    check('title', 'Title is required').notEmpty(),
  check('company', 'Company is required').notEmpty(),
  check('from', 'From date is required and needs to be from the past')
    .notEmpty()
]] ,async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

})

module.exports= router;