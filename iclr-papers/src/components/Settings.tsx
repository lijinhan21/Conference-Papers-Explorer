import React, { useRef, useState } from 'react';
import { Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import { exportUserData, importUserData } from '../services/dataService';

const Settings = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleExport = () => {
    exportUserData();
    setSnackbar({
      open: true,
      message: '数据已成功导出到文件',
      severity: 'success'
    });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        await importUserData(files[0]);
        setSnackbar({
          open: true,
          message: '数据已成功导入',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : '导入失败',
          severity: 'error'
        });
      }
      
      // 重置 file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>数据管理</Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleExport}
        >
          导出数据到本地文件
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleImportClick}
        >
          从本地文件导入数据
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleFileChange}
        />
      </Box>
      
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        导出功能会将您的收藏论文、收藏作者和笔记保存到本地JSON文件中。<br />
        导入功能可以从之前导出的JSON文件中恢复您的数据。
      </Typography>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 