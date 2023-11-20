import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Table, Alert } from 'react-bootstrap';
import Web3 from 'web3';
import EscrowDAppContract from './contracts/EscrowDApp.json';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [deals, setDeals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (window.ethereum) {
          const _web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(_web3);

          const _accounts = await _web3.eth.getAccounts();
          setAccounts(_accounts);

          const networkId = await _web3.eth.net.getId();
          const deployedNetwork = EscrowDAppContract.networks[networkId];
          if (deployedNetwork) {
            const _contract = new _web3.eth.Contract(EscrowDAppContract.abi, deployedNetwork.address);
            setContract(_contract);

            const _deals = await _contract.methods.getAllDeals().call();
            setDeals(_deals);
          } else {
            setError('Contract not deployed on the current network');
          }
        } else {
          setError('Web3 not found. Please install MetaMask.');
        }
      } catch (error) {
        console.error('Error initializing web3:', error);
        setError('Failed to initialize web3. Please try again.');
      }
    };

    initWeb3();
  }, []);

  const createDeal = async (amount, currency, termsOfService) => {
    try {
      if (!web3.utils.isAddress(currency)) {
        throw new Error('Invalid currency address');
      }

      // Validate amount (you can add more validation here)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount. Please enter a valid number greater than 0.');
      }

      await contract.methods.createDeal(amount, currency, termsOfService).send({ from: accounts[0] });
      const _deals = await contract.methods.getAllDeals().call();
      setDeals(_deals);
    } catch (error) {
      console.error('Error creating deal:', error);
      setError(`Failed to create deal: ${error.message}`);
    }
  };

  return (
    <Container>
      <h1>Escrow DApp</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form>
        <Form.Group>
          <Form.Label>Amount</Form.Label>
          <Form.Control type="number" placeholder="Enter amount" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Currency</Form.Label>
          <Form.Control type="text" placeholder="Enter currency address" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Terms of Service</Form.Label>
          <Form.Control type="text" placeholder="Enter terms of service" />
        </Form.Group>
        <Button variant="primary" onClick={() => createDeal(100, '0x123abc', 'Sample terms')}>
          Create Deal
        </Button>
      </Form>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Deal ID</th>
            <th>Client</th>
            <th>Contractor</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id}>
              <td>{deal.id}</td>
              <td>{deal.client}</td>
              <td>{deal.contractor}</td>
              <td>{deal.amount}</td>
              <td>{deal.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default App;
