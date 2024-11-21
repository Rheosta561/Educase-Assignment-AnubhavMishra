const express = require('express'); //requiring express
const mongoose = require('mongoose'); //using mongodb as nosql database
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.use(bodyParser.json());

const mongoUri = "mongodb+srv://manubhav731:0000@test-school.qhd67.mongodb.net/?retryWrites=true&w=majority&appName=Test-School"
mongoose.connect(mongoUri)
.then(() => {
  console.log("Successfully connected to MongoDB");
})
.catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});
const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  });
  
  const School = mongoose.model('School', schoolSchema);
  app.get('/',(req,res)=>{
    res.send("Running");
  });
  

  
  // Adding school api (with mehtod = post)
  app.post('/addSchool', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;
  
    // Validating the input
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const newSchool = new School({
        name,
        address,
        latitude,
        longitude,
      });
  
      await newSchool.save();
      res.status(201).json(newSchool);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add school' });
    }
  });
  
  // List Schools API(sorting onthe basis of distance)
  app.get('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.query;
  
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
  
    try {
      const schools = await School.find();
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6370;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // calculatingw the distasnce in Kilometers
      };
  
      schools.sort((a, b) => {
        const distanceA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
        const distanceB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
  
      res.status(200).json(schools);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch schools' });
    }
  });
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
