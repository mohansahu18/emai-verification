import { useDispatch } from 'react-redux';

import { Box, Alert, Typography } from '@mui/material';

import { startVerification } from 'src/redux/slice/uploadSlice';

export default function ChartAlert() {
  const dispatch = useDispatch();

  const handleStartVerification = () => {
    dispatch(startVerification()); // Dispatch action to reset isUploaded and start verification
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column', // Stack items vertically
        alignItems: 'center', // Center horizontally
        justifyContent: 'center', // Center verticall
        mb: 3,
        mt: 6,
        px: 3,
      }}
    >
      <Alert severity="success" variant="outlined" sx={{ width: '100%' }}>
        <Typography variant="body1" fontWeight={600}>
          Uploaded Successfully
        </Typography>
      </Alert>
      {/* <Button color="primary" sx={{ mt: 2 }} onClick={handleStartVerification}>
        Start Verification
      </Button> */}
    </Box>
  );
}
