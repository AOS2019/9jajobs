document.addEventListener("DOMContentLoaded", function () {
    // Get the job ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!jobId) {
        document.getElementById('jobDetail').innerHTML = "<p>Job not found.</p>";
        return;
    }

    // Fetch job data
    fetch('json/jobs.json')
        .then(response => response.json())
        .then(data => {
            // Find the job with the matching ID
            const job = data.find(job => job.id == jobId); // Ensure comparison is not strict (int vs string)

            if (!job) {
                document.getElementById('jobDetail').innerHTML = "<p>Job not found.</p>";
                return;
            }

            // Display job details
            document.getElementById('jobDetail').innerHTML = `
            <div class="job-details">
                <h2 id='jobTitle'>${job.title}</h2>
                <p id='companyName'><strong>Company:</strong> ${job.company}</p>
                <p id='location'><strong>Location:</strong> ${job.location}</p>
                <p id='datePosted'><strong>Date Posted:</strong> ${job.datePosted}</p>
                <p id='jobDescription'><strong>Description:</strong> ${job.description}</p>
                <p id='keyResponsibilities'><strong>Key Responsibilities:</strong> ${job.keyResponsibilities}</p>
                <p id='requiredSkills'><strong>Required Skills:</strong> ${job.requiredSkills}</p>
                <p id='closingDate'><strong>Closing Date:</strong> ${job.closingDate}</p><br>
                <p id='applicationMethod'><strong>How to Apply:</strong> ${job.applicationMethod}</p>
            </div>
            `;
        })
        .catch(error => {
            console.error("Error fetching job data:", error);
            document.getElementById('jobDetail').innerHTML = "<p>Error loading job details.</p>";
        });
});