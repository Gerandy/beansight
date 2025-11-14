const options = {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
    authorization: 'sk_test_CPnJWnEF7U5E6yhF9TcQnNRr'
  },
  body: JSON.stringify({data: {attributes: {kind: 'instore'}}})
};

fetch('https://api.paymongo.com/v1/qrph/generate', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));