const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;




// Window size
const windowSize = 10;

// Store numbers in an array
let numbers = [];

// Function to fetch numbers from the third-party server
async function fetchNumbers(numberID) {
  let url;
  switch (numberID) {
    case 'p':
      url = 'https://api.example.com/prime-numbers';
      break;
    case 'f':
      url = 'https://api.example.com/fibonacci-numbers';
      break;
    case 'e':
      url = 'https://api.example.com/even-numbers';
      break;
    case 'r':
      url = 'https://api.example.com/random-numbers';
      break;
    default:
      return null;
  }

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching numbers: ${error}`);
    return null;
  }
}

// Function to calculate the average
function calculateAverage() {
  if (numbers.length < windowSize) {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  } else {
    return numbers.reduce((sum, num) => sum + num, 0) / windowSize;
  }
}

// Route for the Average Calculator microservice
app.get('/numbers/:numberID', async (req, res) => {
  const startTime = Date.now();

  // Fetch numbers from the third-party server
  const numbersResponse = await fetchNumbers(req.params.numberID);
  if (!numbersResponse) {
    return res.status(400).json({
      windowPrevState: [],
      windowCurrState: [],
      numbers: [],
      avg: null,
    });
  }

  // Store the numbers
  numbers = [...new Set([...numbers, ...numbersResponse])];
  if (numbers.length > windowSize) {
    numbers.shift();
  }

  // Calculate the average
  const average = calculateAverage();

  // Format the response
  const response = {
    windowPrevState: [...numbers],
    windowCurrState: [...numbers],
    numbers: numbersResponse,
    avg: average.toFixed(2),
  };

  // Ensure the response is within the time limit
  if (Date.now() - startTime > 500) {
    return res.status(500).json({
      windowPrevState: [],
      windowCurrState: [],
      numbers: [],
      avg: null,
    });
  }

  return res.json(response);
});

app.listen(port, () => {
  console.log(`Average Calculator microservice running on port ${port}`);
});