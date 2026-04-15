// backend/routes/wevisa.js — All WeVisa routes
const express = require('express');
const router = express.Router();
const { wevisaAuth } = require('../middleware/wevisaAuth');
const authCtrl = require('../controllers/wevisaAuthController');
const dashCtrl = require('../controllers/wevisaDashboardController');
const crmCtrl = require('../controllers/wevisaCRMController');
const svcCtrl = require('../controllers/wevisaServicesController');
const invCtrl = require('../controllers/wevisaInvoiceController');

// ===== AUTH (public) =====
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/refresh', authCtrl.refresh);

// ===== AUTH (protected) =====
router.get('/auth/me', wevisaAuth, authCtrl.getMe);
router.put('/auth/profile', wevisaAuth, authCtrl.updateProfile);
router.post('/auth/logout', wevisaAuth, authCtrl.logout);

// ===== DASHBOARD =====
router.get('/dashboard/stats', wevisaAuth, dashCtrl.getStats);

// ===== CRM =====
router.get('/crm/leads', wevisaAuth, crmCtrl.getLeads);
router.post('/crm/leads', wevisaAuth, crmCtrl.createLead);
router.put('/crm/leads/:id', wevisaAuth, crmCtrl.updateLead);
router.delete('/crm/leads/:id', wevisaAuth, crmCtrl.deleteLead);
router.get('/crm/stats', wevisaAuth, crmCtrl.getStats);
router.get('/crm/tasks', wevisaAuth, crmCtrl.getTasks);
router.post('/crm/tasks', wevisaAuth, crmCtrl.createTask);
router.put('/crm/tasks/:id', wevisaAuth, crmCtrl.updateTask);

// ===== VISA APPLICATIONS =====
router.get('/applications', wevisaAuth, svcCtrl.getApplications);
router.post('/applications', wevisaAuth, svcCtrl.createApplication);

// ===== USA APPOINTMENTS =====
router.get('/usa-appointments', wevisaAuth, svcCtrl.getUSAAppointments);
router.post('/usa-appointments', wevisaAuth, svcCtrl.createUSAAppointment);
router.put('/usa-appointments/:id', wevisaAuth, svcCtrl.updateUSAAppointment);

// ===== SCHENGEN APPOINTMENTS =====
router.get('/schengen-appointments', wevisaAuth, svcCtrl.getSchengenAppointments);
router.post('/schengen-appointments', wevisaAuth, svcCtrl.createSchengenAppointment);

// ===== DUMMY TICKETS =====
router.get('/dummy-tickets', wevisaAuth, svcCtrl.getDummyTickets);
router.post('/dummy-tickets', wevisaAuth, svcCtrl.generateDummyTicket);

// ===== INVOICES =====
router.get('/invoices', wevisaAuth, invCtrl.getInvoices);
router.post('/invoices', wevisaAuth, invCtrl.createInvoice);
router.put('/invoices/:id', wevisaAuth, invCtrl.updateInvoice);
router.delete('/invoices/:id', wevisaAuth, invCtrl.deleteInvoice);
router.get('/invoices/stats', wevisaAuth, invCtrl.getStats);

// ===== PACKAGES =====
router.get('/packages', svcCtrl.getPackages);

module.exports = router;
