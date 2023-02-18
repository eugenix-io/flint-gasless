import axios from "axios";
export const isTokenApproved = async (tokenAddress, walletAddress) => {

    try {
  
        // console.log(signer, 'Signer hrer$$$');

        const resp = await axios.get(`http://localhost:5001/mtx/get-allowance?wa=${walletAddress}&ta=${tokenAddress}`);

        const allowance = resp.data.allowance;
  
        console.log(allowance, 'Allowance for contract...');
    
        return allowance;
    } catch (error) {
        console.log('Failed to check approval status', error);
        return 'asa';
    }
  
  }