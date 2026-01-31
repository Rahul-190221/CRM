import express from 'express';
import { getContacts, getContact, createContact, updateContact, deleteContact } from '../controllers/contacts.controller';

const router = express.Router();

router.get('/', getContacts);
router.get('/:id', getContact);
router.post('/', createContact);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
