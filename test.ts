#!/usr/bin/env npx ts-node
import { Octokit } from "octokit";

const main = async (): Promise<void> => {

  // Octokit.js
  // https://github.com/octokit/core.js#readme
  const octokit = new Octokit({
    // auth: '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'
    auth: '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'
  })

  // await octokit.request('GET /repos/{owner}/{repo}/pages/builds', {
  await octokit.request('GET /repos/{owner}/{repo}/pages', {
    owner: 'ryan-thorburn',
    repo: 'wikitest',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  // // Replace with your GitHub personal access token
  // const githubToken = "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";

  // // Create a new Octokit instance with the provided token
  // const octokit = new Octokit({ 
  //   auth: githubToken,
  // });

  // // Define the repository owner and name
  // const owner = "ryan-thorburn";
  // const repo = "wikitest";

  // // Call the GitHub API to retrieve the list of wiki pages for the repository
  // // const response = await octokit.request('GET /repos/{owner}/{repo}/wikis', {
  // const response = await octokit.request('GET /repos/{owner}/{repo}/pages/builds', {
  //   owner,
  //   repo
  // });

  // // Output the list of wiki pages to the console
  // console.log(response.data);
};

void main();