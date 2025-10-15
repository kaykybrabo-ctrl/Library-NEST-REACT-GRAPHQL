import { Scalar, CustomScalar } from '@nestjs/graphql';
import { ValueNode } from 'graphql';
import { GraphQLError } from 'graphql';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

@Scalar('Upload')
export class Upload implements CustomScalar<any, any> {
  description = 'Upload custom scalar type';

  parseValue(value: any): FileUpload {
    return value;
  }

  serialize(value: FileUpload): any {
    return value;
  }

  parseLiteral(ast: ValueNode): FileUpload {
    throw new GraphQLError('Upload literal unsupported', { nodes: ast });
  }
}
