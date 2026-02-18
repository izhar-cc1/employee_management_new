import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Paper, TextField, List, ListItem, ListItemText, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, styled } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "./hooks/useAuth.js";
import api from './api/client.js';

const ITEMS_PER_PAGE = 6;

const ContentArea = styled(Box)({
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
});

const ContentAreaHead = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  width: '100%',
  backgroundColor: '#fff',
  zIndex: 1,
  padding: '10px 0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Shadow for better separation
});

const SearchArea = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const TypographyError = styled(Typography)({
  color:'red',
  textAlign:'center',
  marginTop:'25%'
})

const StyledTableContainer = styled(TableContainer)({
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#4facfe',
  '& th': {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const DepartmentListItem = styled(ListItem)({
  marginBottom: '10px',
  borderRadius: '8px',
  padding: '10px',
  backgroundColor: '#e0f7fa',
  '&:hover': {
    backgroundColor: '#b2ebf2',
  },
});

const ProjectListItem = styled(ListItem)({
  marginBottom: '10px',
  borderRadius: '8px',
  padding: '10px',
  backgroundColor: '#e8f5e9',
  '&:hover': {
    backgroundColor: '#c8e6c9',
  },
});

export default function Home() {
  const { loading } = useAuth();
  const role = localStorage.getItem('role') || 'Employee';
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('employees'); // 'employees', 'departments', or 'projects'
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Active'); // Default status
  const statusOptions = ['Active', 'Terminated', 'Retired', 'Resigned'];
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'Employee') {
      navigate('/dashboard');
      return;
    }
    api.get('/')
      .then(response => {
        setEmployees(response.data);
        // Extract unique departments
        const uniqueDepartments = [
          ...new Set(
            (response.data || [])
              .map(emp => emp?.department)
              .filter(dept => typeof dept === 'string' && dept.trim() !== '')
          )
        ];
        setDepartments(uniqueDepartments);
      })
      .catch(error => console.error('Error fetching employees:', error));

    // Fetch projects
    api.get('/projects/')
      .then(response => setProjects(response.data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam && viewParam !== view) {
      setView(viewParam);
    }
  }, [searchParams, view]);

  const handleAddEmployeeClick = () => {
    navigate('/add-employee');
  };

  
  const handleUploadEmployeeClick = () => {
    navigate('/upload-employee');
  };

  const handleAddProjectClick = () => {
    navigate('/add-project');
  };

  const handleViewMoreClick = (id) => {
    navigate('/employee-details', { state: { employeeId: id } });
  };

  const handleProjectViewMoreClick = (id) => {
    navigate('/project-details', { state: { projectId: id } });
  };


  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDashboardClick = (type) => {
    setView(type);
    setSearchParams({ view: type });
    setSelectedDepartment('');
    setSelectedStatus(type === 'employees' ? 'Active' : selectedStatus);
    setCurrentPage(1);
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setView('employees');
    setSearchParams({ view: 'employees' });
    setCurrentPage(1);
  };


  const handleStatusClick = (cstatus) => {
    setSelectedStatus(cstatus);
    setView('employees'); // Return to employees view with status filter applied
    setSearchParams({ view: 'employees' });
    console.log(cstatus);
    setCurrentPage(1);
    
  };

  const filteredEmployees = useMemo(
    () =>
      employees.filter(employee =>
        (`${employee.first_name ?? ''} ${employee.last_name ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (employee.department ?? '').toLowerCase().includes(searchQuery.toLowerCase())) &&
        (view === 'employees' ? (selectedDepartment ? employee.department === selectedDepartment : true) : true) &&
        (view === 'employees' ? employee.status === selectedStatus : true)
      ),
    [employees, searchQuery, selectedDepartment, selectedStatus, view]
  );

  if (loading) {
    return null; // or spinner
  }




  const indexOfLastEmployee = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstEmployee = indexOfLastEmployee - ITEMS_PER_PAGE;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
      <ContentArea>
        <ContentAreaHead>
          <Typography variant="h4" gutterBottom>
          {view === 'employees' ? 'Employee List' : view === 'departments' ? 'Departments' : view === 'projects' ? 'Projects' : 'Employee Status'}
          </Typography>
          <SearchArea>
            {view === 'employees' ? (
              <>
                <TextField
                  variant="outlined"
                  placeholder="Search by name or department"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{ marginRight: '10px', width: '250px' }}
                />
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#45a049' }, height: '40px', marginRight: '10px'  }}
                  onClick={handleUploadEmployeeClick}
                >
                  Upload
                </Button>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#45a049' }, height: '40px' }}
                  onClick={handleAddEmployeeClick}
                >
                  Add Employee
                </Button>
              </>
            ) : view === 'departments' ? (
              <Button
                variant="contained"
                sx={{ backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#45a049' }, height: '40px' }}
                onClick={() => handleDashboardClick('employees')}
              >
                Back to Employees
              </Button>
            ) : view === 'projects' ? (
              <>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#45a049' }, height: '40px' }}
                  onClick={handleAddProjectClick}
                >
                  New Project
                </Button>
              </>
            ) : view === 'status' ? (
              <Box>
                {statusOptions.map(status => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? 'contained' : 'outlined'}
                    sx={{ marginRight: '10px' }}
                    onClick={() => handleStatusClick(status)}
                  >
                    {status}
                  </Button>
                ))}
              </Box>
            ) : null}
          </SearchArea>
        </ContentAreaHead>
        <Box />
        {view === 'employees' ? (currentEmployees.length>0 ? (
          <>
          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {currentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                    <TableCell>{employee.current_role}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#45a049' } }}
                        onClick={() => handleViewMoreClick(employee.id)}
                      >
                        View More
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
          <Box display="flex" justifyContent="center" alignItems="center" marginTop="20px">
          <Button
            variant="contained"
            color="primary"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            sx={{ marginRight: '10px' }}
          >
            Previous
          </Button>
          <Typography variant="body1">
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            sx={{ marginLeft: '10px' }}
          >
            Next
          </Button>
        </Box>
          </>
        ) :<TypographyError  variant='h5'>No Datas Found</TypographyError>): view === 'departments' ? (
          <Box>
            <TextField
              variant="outlined"
              placeholder="Search departments"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ marginBottom: '20px', width: '250px' }}
            />
            <List>
              {departments
                .filter(department => typeof department === 'string')
                .filter(department => department.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(department => (
                <DepartmentListItem button key={department} onClick={() => handleDepartmentClick(department)}>
                  <ListItemText primary={department} />
                </DepartmentListItem>
              ))}
            </List>
          </Box>
        ) : view === 'projects' ? (
          projects.length>0 ? 
         (
          <Box>
            <TextField
              variant="outlined"
              placeholder="Search projects"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ marginBottom: '20px', width: '250px' }}
            />
            <StyledTableContainer component={Paper}>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Project Manager</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {/* {projects.filter(project => project.name.toLowerCase().includes(searchQuery.toLowerCase())).map((project) => ( */}
                    {projects.filter(project => project?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map(project => (
                    <TableRow key={project._id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.managerName || project.manager || 'N/A'}</TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#45a049' } }}
                          onClick={() => handleProjectViewMoreClick(project._id)}
                        >
                          View More
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </Box>
        ):(<TypographyError  variant='h5'>No Datas Found</TypographyError>)) : view === 'status' ? (
          <Box>
            {/* This section will be dynamically updated based on status filter */}
          </Box>
        ): null}
      </ContentArea>
  );
}
