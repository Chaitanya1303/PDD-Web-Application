const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/repos/Chaitanya1303/PDD-Web-Application/actions/runs',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js',
    'Accept': 'application/vnd.github.v3+json'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    const testRun = runs.find(r => r.name === 'E2E Tests' && r.conclusion === 'failure');
    if (!testRun) return;
    
    https.get({
      hostname: 'api.github.com',
      path: `/repos/Chaitanya1303/PDD-Web-Application/actions/runs/${testRun.id}/jobs`,
      headers: { 'User-Agent': 'Node.js' }
    }, (jobRes) => {
      let jobData = '';
      jobRes.on('data', (chunk) => jobData += chunk);
      jobRes.on('end', () => {
        const jobs = JSON.parse(jobData).jobs;
        const testJob = jobs[0];
        
        https.get({
          hostname: 'api.github.com',
          path: `/repos/Chaitanya1303/PDD-Web-Application/actions/jobs/${testJob.id}/logs`,
          headers: { 'User-Agent': 'Node.js', 'Accept': 'application/vnd.github.v3+json' }
        }, (logRes) => {
          if (logRes.statusCode === 302) {
            https.get(logRes.headers.location, (finalRes) => {
              let logData = '';
              finalRes.on('data', chunk => logData += chunk);
              finalRes.on('end', () => console.log(logData.substring(logData.length - 2000)));
            });
          }
        });
      });
    });
  });
}).on('error', console.error);
