const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const entityRoutes = require('./routes/entityRoutes');
const universeRoutes = require('./routes/universeRoutes');
const templateRoutes = require('./routes/templateRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/entities', entityRoutes);
app.use('/api/templates', templateRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://127.0.0.1:27017/demiurgeDB')
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log(err));

app.use('/api/universes', universeRoutes);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});