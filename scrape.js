// scrape.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Only process jobs with this posted date
const targetDate = "14th Mar, 2025";
const url = 'https://www.hotnigerianjobs.com/'; // URL to scrape

async function scrapeJobs() {
  try {
    // Fetch page HTML
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const scrapedJobs = [];

    // Iterate through each job container
    $('.mycase').each((i, element) => {
      // --- Extract Title & Company ---
      const fullTitle = $(element).find('.jobheader h1 a').text().trim();
      let title = fullTitle;
      let company = "";
      if (fullTitle.includes(" at ")) {
        [title, company] = fullTitle.split(" at ");
        title = title.trim();
        company = company.trim();
      } else {
        // Fallback: use title attribute
        const titleAttr = $(element).find('.jobheader h1 a').attr('title');
        if (titleAttr && titleAttr.includes(" at ")) {
          [title, company] = titleAttr.replace("Permanent Link: ", "").split(" at ");
          title = title.trim();
          company = company.trim();
        }
      }

      // --- Extract Posted Date ---
      let semibioText = "";
      $(element).find('.semibio').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes("Posted on")) {
          semibioText = text;
        }
      });
      const dateRegex = /(\d{1,2}(st|nd|rd|th)\s+[A-Za-z]{3},\s+\d{4})/;
      const dateMatch = semibioText.match(dateRegex);
      let datePosted = dateMatch ? dateMatch[1] : "";
      
      // Only process jobs that match the target date
      if (datePosted !== targetDate) return;

      // --- Extract Location ---
      let location = "";
      $(element).find('p').each((i, p) => {
        const htmlContent = $(p).html() || "";
        if (htmlContent.includes("Location:")) {
          location = $(p).text().replace("Location:", "").trim();
        }
      });

      // --- Extract Description ---
      let description = "";
      const descHeader = $(element).find('p strong').filter((i, el) => $(el).text().trim() === "Description");
      if (descHeader.length > 0) {
        const descP = descHeader.parent();
        // Assume the following <ul> holds the description items
        const descList = descP.next('ul');
        if (descList.length > 0) {
          const liTexts = [];
          descList.find('li').each((i, li) => {
            liTexts.push($(li).text().trim());
          });
          description = liTexts.join(" ");
        }
      }

      // --- Extract Application Closing Date ---
      let closingDate = "";
      const closeHeader = $(element).find('p strong').filter((i, el) => $(el).text().trim().includes("Application Closing Date"));
      if (closeHeader.length > 0) {
        const closeP = closeHeader.parent();
        closingDate = closeP.text().replace("Application Closing Date", "").trim();
      }

      // --- Extract Application Method ---
      let applicationMethod = "";
      const applyHeader = $(element).find('p strong').filter((i, el) => $(el).text().trim().includes("How to Apply"));
      if (applyHeader.length > 0) {
        const applyP = applyHeader.parent();
        const a = applyP.find('a').first();
        if (a.length > 0) {
          applicationMethod = a.attr('href').trim();
        }
      }

      // --- Key Responsibilities & Required Skills ---
      // These fields are not clearly defined in the provided template,
      // so we leave them empty (or adjust extraction if available).
      let keyResponsibilities = "";
      let requiredSkills = "";

      // Build the job object
      const job = {
        title,
        company,
        location,
        description,
        keyResponsibilities,
        requiredSkills,
        closingDate,
        datePosted,
        applicationMethod
      };

      scrapedJobs.push(job);
    });

    if (scrapedJobs.length === 0) {
      console.log(`No jobs found for the date: ${targetDate}`);
      return;
    }

    // --- Append to jobs.json with incremental IDs ---
    const jobsFilePath = path.join(__dirname, 'public', 'json', 'jobs.json');
    let existingJobs = [];
    if (fs.existsSync(jobsFilePath)) {
      try {
        const fileData = fs.readFileSync(jobsFilePath, 'utf8');
        existingJobs = JSON.parse(fileData);
      } catch (parseErr) {
        console.error("Error parsing jobs.json:", parseErr);
        existingJobs = [];
      }
    }

    // Determine the next incremental id
    let nextId = 1;
    if (existingJobs.length > 0) {
      const ids = existingJobs.map(job => job.id);
      nextId = Math.max(...ids) + 1;
    }

    // Assign ids and append new jobs
    scrapedJobs.forEach(job => {
      job.id = nextId++;
      existingJobs.push(job);
    });

    fs.writeFileSync(jobsFilePath, JSON.stringify(existingJobs, null, 2), 'utf8');
    console.log("Scraping complete. Jobs appended to jobs.json");

  } catch (error) {
    console.error("Error during scraping:", error);
  }
}

scrapeJobs();




    // Path to the jobs.json file
    //const jobsFilePath = path.join(__dirname, 'public', 'json', 'jobs.json');
     // node scrape.js "Fri 14th Mar, 2025"
