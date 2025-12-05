import type { Prisma } from '@prisma/client';
import type { OffsetQuery, CreateInquiryBody, UpdateInquiryBody } from './inquiry.dto.js';
import type { InquiryRepository } from './inquiry.repository.js';
import { NotFoundError, ForbiddenError } from '../../common/utils/errors.js';

export class InquiryService {
  constructor(private inquiryRepository: InquiryRepository) {}

  public getInquiries = async (productId: string) => {
    const product = await this.inquiryRepository.findProduct(productId);
    if (!product) throw new NotFoundError('상품이 존재하지 않습니다.');

    const countQuery: Prisma.InquiryCountArgs = {
      where: { productId },
    };

    const getQuery: Prisma.InquiryFindManyArgs = {
      where: { productId },
      orderBy: {
        createdAt: 'desc',
      },
    };

    const [totalCount, inquiries] = await Promise.all([
      this.inquiryRepository.countInquiries(countQuery),
      this.inquiryRepository.getInquiries(getQuery),
    ]);

    return {
      list: inquiries,
      totalCount,
    };
  };

  public createInquiry = async (productId: string, userId: string, data: CreateInquiryBody) => {
    const findProduct = await this.inquiryRepository.findProduct(productId);
    if (!findProduct) throw new NotFoundError('상품이 존재하지 않습니다.');

    const { title, content, isSecret } = data;

    const createData: Prisma.InquiryCreateInput = {
      title,
      content,
      isSecret,
      user: {
        connect: {
          id: userId,
        },
      },
      product: {
        connect: {
          id: productId,
        },
      },
    };

    const inquiry = await this.inquiryRepository.createInquiry(createData);

    return inquiry;
  };

  public getAllInquiries = async (query: OffsetQuery, userId: string) => {
    const { page = '1', pageSize = '100', status } = query;

    const pageInt = parseInt(page, 10) || 1;
    const pageSizeInt = parseInt(pageSize, 10) || 100;

    const take = pageSizeInt;
    const skip = (pageInt - 1) * take;

    const countQuery: Prisma.InquiryCountArgs = {
      where: { userId },
    };

    const getQuery: Prisma.InquiryFindManyArgs = {
      where: {
        ...(status && { status }),
        userId,
      },
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    };

    const [totalCount, inquiries] = await Promise.all([
      this.inquiryRepository.countInquiries(countQuery),
      this.inquiryRepository.getAllInquiries(getQuery),
    ]);

    return {
      list: inquiries,
      totalCount,
    };
  };

  public getInquiry = async (id: string) => {
    const inquiry = await this.inquiryRepository.getInquiry(id);
    if (!inquiry) throw new NotFoundError('문의가 존재하지 않습니다.');

    return inquiry;
  };

  public updateInquiry = async (id: string, userId: string, data: UpdateInquiryBody) => {
    const findInquiry = await this.inquiryRepository.findInquiry(id);
    if (!findInquiry) throw new NotFoundError('문의가 존재하지 않습니다.');
    if (findInquiry.userId !== userId) throw new ForbiddenError('문의를 수정할 권한이 없습니다.');
    if (findInquiry.status == 'CompletedAnswer')
      throw new ForbiddenError('답변 완료된 문의는 수정할 수 없습니다.');

    const { title, content, isSecret } = data;

    const updateData: Prisma.InquiryUpdateInput = {
      ...(title !== findInquiry.title && { title }),
      ...(content !== findInquiry.content && { content }),
      ...(isSecret !== findInquiry.isSecret && { isSecret }),
    };

    const inquiry = await this.inquiryRepository.updateInquiry(id, updateData);

    return inquiry;
  };

  public deleteInquiry = async (id: string, userId: string) => {
    const findInquiry = await this.inquiryRepository.findInquiry(id);
    if (!findInquiry) throw new NotFoundError('문의가 존재하지 않습니다.');
    if (findInquiry.userId !== userId) throw new ForbiddenError('문의를 삭제할 권한이 없습니다.');

    const inquiry = await this.inquiryRepository.deleteInquiry(id);

    return inquiry;
  };

  // TODO : 답변 로직 추가
  // public getReply = async (id: string) => {};

  // public createReply = async (id: string, userId: string, data: CreateReplyBody) => {};

  // public updateReply = async (id: string, userId: string, data: UpdateReplyBody) => {};
}
