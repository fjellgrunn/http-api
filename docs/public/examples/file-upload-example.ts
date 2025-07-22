/**
 * File Upload Example
 *
 * This example demonstrates file upload capabilities
 * with @fjell/http-api including basic uploads, async uploads,
 * and progress tracking.
 */

import { post, postFileMethod, uploadAsyncMethod } from '@fjell/http-api';

// Mock upload endpoints
const UPLOAD_API = 'https://api.example.com';

interface ProgressCallback {
  (progress: number): void;
}

async function basicFileUploadExample() {
  console.log('=== Basic File Upload Example ===\n');

  try {
    // Simulate file upload (in a real app, this would come from a form or file input)
    const fileData = Buffer.from('This is test file content for demonstration');
    const file = new File([fileData], 'test-document.txt', { type: 'text/plain' });

    console.log('1. Basic File Upload...');
    const uploadResponse = await postFileMethod(`${UPLOAD_API}/upload`, file, {
      accept: 'application/json',
      isAuthenticated: false
    });

    console.log('Upload successful:', uploadResponse);

    // Upload with additional form fields
    console.log('\n2. File Upload with Additional Fields...');
    const imageFile = new File([fileData], 'profile-image.jpg', { type: 'image/jpeg' });

    const uploadWithFields = await postFileMethod(`${UPLOAD_API}/upload/profile`, imageFile, {
      headers: {
        'X-User-ID': '12345',
        'Authorization': 'Bearer token-here'
      },
      params: {
        category: 'profile',
        public: true,
        resize: '200x200'
      },
      isAuthenticated: true
    });

    console.log('Profile image uploaded:', uploadWithFields);

  } catch (error) {
    console.error('File upload failed:', error.message);
  }
}

async function asyncFileUploadExample() {
  console.log('\n=== Async File Upload Example ===\n');

  try {
    // Large file simulation
    const largeFileData = Buffer.alloc(1024 * 1024 * 5); // 5MB file
    const largeFile = new File([largeFileData], 'large-document.pdf', { type: 'application/pdf' });

    console.log('1. Async Upload with Progress Tracking...');

    let lastProgress = 0;
    const progressCallback: ProgressCallback = (progress: number) => {
      if (progress - lastProgress >= 10 || progress === 100) {
        console.log(`Upload progress: ${progress}%`);
        lastProgress = progress;
      }
    };

    const asyncUploadResponse = await uploadAsyncMethod(`${UPLOAD_API}/upload/async`, largeFile, {
      headers: {
        'Authorization': 'Bearer async-token'
      },
      params: {
        chunk_size: 1048576, // 1MB chunks
        concurrent_uploads: 3
      },
      onProgress: progressCallback,
      isAuthenticated: true
    });

    console.log('Async upload initiated:', asyncUploadResponse);

    // Check upload status
    console.log('\n2. Checking Upload Status...');
    const uploadId = asyncUploadResponse.upload_id;

    let status = 'processing';
    while (status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await fetch(`${UPLOAD_API}/upload/status/${uploadId}`, {
        headers: {
          'Authorization': 'Bearer async-token'
        }
      });

      const statusData = await statusResponse.json();
      status = statusData.status;
      console.log(`Upload status: ${status} (${statusData.progress || 0}%)`);
    }

    console.log('Final upload status:', status);

  } catch (error) {
    console.error('Async upload failed:', error.message);
  }
}

async function multipleFileUploadExample() {
  console.log('\n=== Multiple File Upload Example ===\n');

  try {
    const files = [
      new File([Buffer.from('Document 1 content')], 'doc1.txt', { type: 'text/plain' }),
      new File([Buffer.from('Document 2 content')], 'doc2.txt', { type: 'text/plain' }),
      new File([Buffer.from('Image data')], 'image.jpg', { type: 'image/jpeg' })
    ];

    console.log('1. Sequential File Uploads...');
    const uploadResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);

      const result = await postFileMethod(`${UPLOAD_API}/upload/batch`, file, {
        headers: {
          'X-Batch-ID': 'batch-123',
          'X-File-Index': i.toString()
        },
        params: {
          batch: true
        }
      });

      uploadResults.push(result);
      console.log(`File ${file.name} uploaded successfully`);
    }

    console.log('All files uploaded:', uploadResults);

    // Finalize batch upload
    console.log('\n2. Finalizing Batch Upload...');
    const batchResult = await post(`${UPLOAD_API}/upload/batch/finalize`, {
      batch_id: 'batch-123',
      file_count: files.length
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Batch upload finalized:', batchResult);

  } catch (error) {
    console.error('Multiple file upload failed:', error.message);
  }
}

async function resumableUploadExample() {
  console.log('\n=== Resumable Upload Example ===\n');

  try {
    const fileData = Buffer.alloc(1024 * 1024 * 10); // 10MB file
    const file = new File([fileData], 'large-video.mp4', { type: 'video/mp4' });

    console.log('1. Initiating Resumable Upload...');

    // Start resumable upload session
    const initResponse = await post(`${UPLOAD_API}/upload/resumable/init`, {
      filename: file.name,
      size: file.size,
      content_type: file.type
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer resumable-token'
      }
    });

    const uploadUrl = initResponse.upload_url;
    const sessionId = initResponse.session_id;

    console.log(`Upload session created: ${sessionId}`);

    // Simulate upload with chunks
    console.log('\n2. Uploading in Chunks...');
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunkData = fileData.slice(start, end);

      console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (${start}-${end - 1}/${file.size})`);

      const chunkFile = new File([chunkData], `chunk-${chunkIndex}`, { type: 'application/octet-stream' });

      await postFileMethod(uploadUrl, chunkFile, {
        headers: {
          'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
          'X-Session-ID': sessionId
        }
      });
    }

    // Finalize resumable upload
    console.log('\n3. Finalizing Resumable Upload...');
    const finalizeResponse = await post(`${UPLOAD_API}/upload/resumable/finalize`, {
      session_id: sessionId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer resumable-token'
      }
    });

    console.log('Resumable upload completed:', finalizeResponse);

  } catch (error) {
    console.error('Resumable upload failed:', error.message);

    // Handle resume logic
    console.log('Attempting to resume upload...');
    // In a real implementation, you would check the server for uploaded chunks
    // and resume from the last successful chunk
  }
}

async function fileUploadWithValidationExample() {
  console.log('\n=== File Upload with Validation Example ===\n');

  try {
    // File validation before upload
    console.log('1. File Validation...');

    const validateFile = (file: File): string[] => {
      const errors: string[] = [];
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];

      if (file.size > maxSize) {
        errors.push(`File size ${file.size} exceeds maximum of ${maxSize} bytes`);
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
      }

      return errors;
    };

    const testFile = new File([Buffer.from('Valid file content')], 'document.pdf', { type: 'application/pdf' });
    const validationErrors = validateFile(testFile);

    if (validationErrors.length > 0) {
      console.error('Validation failed:', validationErrors);
      return;
    }

    console.log('File validation passed');

    // Upload with server-side validation
    console.log('\n2. Upload with Server Validation...');
    const validatedUpload = await postFileMethod(`${UPLOAD_API}/upload/validated`, testFile, {
      headers: {
        'X-Validation-Rules': JSON.stringify({
          max_size: 10485760, // 10MB
          allowed_types: ['application/pdf'],
          scan_for_malware: true
        })
      },
      params: {
        validate: true
      }
    });

    console.log('Validated upload successful:', validatedUpload);

  } catch (error) {
    console.error('Validated upload failed:', error.message);

    if (error.status === 400) {
      console.log('Server validation failed - check file requirements');
    } else if (error.status === 413) {
      console.log('File too large');
    }
  }
}

// Run all file upload examples
async function runFileUploadExamples() {
  await basicFileUploadExample();
  await asyncFileUploadExample();
  await multipleFileUploadExample();
  await resumableUploadExample();
  await fileUploadWithValidationExample();
}

if (require.main === module) {
  runFileUploadExamples().catch(console.error);
}

export {
  basicFileUploadExample,
  asyncFileUploadExample,
  multipleFileUploadExample,
  resumableUploadExample,
  fileUploadWithValidationExample
};
