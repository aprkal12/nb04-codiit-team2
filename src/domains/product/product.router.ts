import { Router } from 'express';
import { nestedInquiryRouter } from '../inquiry/inquiry.router.js';

const productRouter = Router();

productRouter.use('/:productId/inquiries', nestedInquiryRouter);

export default productRouter;
