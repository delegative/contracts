import lighthouse from '@lighthouse-web3/sdk'

export async function uploadJson(text) {
// export const uploadJson(text) = async() =>{
  const apiKey = '3b873af7.f9dfeeb48073400789f404cbe250ab7e'
  const response = await lighthouse.uploadText(
    text,
    apiKey
  );
  
  // Display response
  console.log(response);
  /*
  {
    data: {
      Name: 'Qmbz13iSeUU1y1z4JGcLNSBH1bFveWzpyTk1drZ6iKSVvd',
      Hash: 'Qmbz13iSeUU1y1z4JGcLNSBH1bFveWzpyTk1drZ6iKSVvd',
      Size: '24'
    }
  }
  */
  console.log("Visit at: https://gateway.lighthouse.storage/ipfs/" + response.data.Hash);
  return response
}

