const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/repos/Chaitanya1303/PDD-Web-Application/actions/runs',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    const latestRuns = runs.slice(0, 3);
    latestRuns.forEach(run => {
      console.log(`Run ${run.id}: ${run.name} - ${run.conclusion}`);
      
      const jobsOptions = {
        hostname: 'api.github.com',
        path: `/repos/Chaitanya1303/PDD-Web-Application/actions/runs/${run.id}/jobs`,
        method: 'GET',
        headers: { 'User-Agent': 'Node.js' }
      };
      
      https.get(jobsOptions, (jobRes) => {
        let jobData = '';
        jobRes.on('data', (chunk) => jobData += chunk);
        jobRes.on('end', () => {
          const jobs = JSON.parse(jobData).jobs;
          jobs.forEach(job => {
            console.log(`  Job ${job.name}: ${job.conclusion}`);
            job.steps.forEach(step => {
              if (step.conclusion === 'failure') {
                console.log(`    Failed step: ${step.name}`);
              }
            });
          });
        });
      });
    });
  });
}).on('error', (e) => {
  console.error(e);
});
