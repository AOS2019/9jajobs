// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS, JSON, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// POST endpoint to handle job submissions
app.post('/api/postJob', (req, res) => {
  const newJob = req.body;
  const filePath = path.join(__dirname, 'public', 'json', 'jobs.json');

  // Read the current jobs from the JSON file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading jobs file:', err);
      return res.status(500).json({ error: 'Error reading jobs file' });
    }
    
    let jobs;
    try {
      jobs = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing jobs JSON:', parseErr);
      return res.status(500).json({ error: 'Error parsing jobs JSON' });
    }
    
    // Determine the next incremental id
    let newId = 1;
    if (jobs.length > 0) {
      const ids = jobs.map(job => job.id);
      newId = Math.max(...ids) + 1;
    }
    newJob.id = newId;

    // Set the date posted (format as needed)
    newJob.datePosted = new Date().toISOString().split('T')[0];
    
    // Add the new job to the jobs array
    jobs.push(newJob);

    // Write the updated jobs array back to the JSON file
    fs.writeFile(filePath, JSON.stringify(jobs, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing to jobs file:', writeErr);
        return res.status(500).json({ error: 'Error writing to jobs file' });
      }
      res.json({ message: 'Job posted successfully', job: newJob });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
