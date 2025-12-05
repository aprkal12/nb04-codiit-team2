import type { Prisma, PrismaClient } from '@prisma/client';

export class InquiryRepository {
  constructor(private prisma: PrismaClient) {}

  public getInquiries = async (getQuery: Prisma.InquiryFindManyArgs) => {
    const inquiries = await this.prisma.inquiry.findMany({
      ...getQuery,
      select: {
        id: true,
        userId: true,
        productId: true,
        title: true,
        content: true,
        status: true,
        isSecret: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
          },
        },
        reply: {
          select: {
            id: true,
            inquiryId: true,
            userId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return inquiries;
  };

  public createInquiry = async (createData: Prisma.InquiryCreateInput) => {
    const inquiry = await this.prisma.inquiry.create({
      data: createData,
      select: {
        id: true,
        userId: true,
        productId: true,
        title: true,
        content: true,
        status: true,
        isSecret: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return inquiry;
  };

  public getAllInquiries = async (getQuery: Prisma.InquiryFindManyArgs) => {
    const inquiries = await this.prisma.inquiry.findMany({
      ...getQuery,
      select: {
        id: true,
        title: true,
        isSecret: true,
        status: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        content: true,
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return inquiries;
  };

  public getInquiry = async (id: string) => {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        productId: true,
        title: true,
        content: true,
        status: true,
        isSecret: true,
        createdAt: true,
        updatedAt: true,
        reply: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    return inquiry;
  };

  public updateInquiry = async (id: string, updateData: Prisma.InquiryUpdateInput) => {
    const inquiry = await this.prisma.inquiry.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        productId: true,
        title: true,
        content: true,
        status: true,
        isSecret: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return inquiry;
  };

  public deleteInquiry = async (id: string) => {
    const inquiry = await this.prisma.inquiry.delete({
      where: { id },
      select: {
        id: true,
        userId: true,
        productId: true,
        title: true,
        content: true,
        status: true,
        isSecret: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return inquiry;
  };

  public findProduct = async (productId: string) => {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    return product;
  };

  public findInquiry = async (id: string) => {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
    });

    return inquiry;
  };

  public countInquiries = async (countQuery: Prisma.InquiryCountArgs) => {
    const count = await this.prisma.inquiry.count(countQuery);

    return count;
  };
}
