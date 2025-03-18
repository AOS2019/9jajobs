fetch('json/jobs.json')
  .then((res) => res.json())
  .then((data) => {
    // Function to convert date strings to Date objects
    function parseDate(dateStr) {
      // Check for ISO format (YYYY-MM-DD)
      const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (isoRegex.test(dateStr)) {
        return new Date(dateStr);
      } else {
        // Remove ordinal suffixes like "st", "nd", "rd", "th" and any extra commas
        const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(',', '');
        return new Date(cleaned);
      }
    }
    
    // Sort the data by datePosted (most recent first)
    data.sort((a, b) => parseDate(b.datePosted) - parseDate(a.datePosted));

    // Append sorted job listings to the page
    data.forEach(function(emp) {
      $('#jobListings').append(`
        <div class="job-listing">
          <h2 class="job-title">
            <a style="text-decoration: none;" href="job-details.html?id=${emp.id}">
              ${emp.title}
            </a>
          </h2>
          <p class="job-details">
            Company: ${emp.company} | Location: ${emp.location} | Date Posted: ${emp.datePosted}
          </p>
          <p>
            ${emp.description.length > 100 ? emp.description.substring(0, 100) + '...' : emp.description}
          </p>
          <button class="apply-button" onclick="window.location.href='job-details.html?id=${emp.id}'">
            Apply
          </button>
        </div>
      `);
    });
  })
  .catch(err => console.error(err));
