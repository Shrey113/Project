const path = require('path');
const fs = require('fs');
const {google} = require('googleapis');



const Client_id ='1003015936704-sfpga73cctpmlb4o2u636f63p2pbhil5.apps.googleusercontent.com'
const Client_secret ='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'
const redirect_uris = 'https://developers.google.com/oauthplayground'


const refresh_token ='1//04d9fd5LKART2CgYIARAAGAQSNwF-L9IrVUtYktt9-ARof400JKKxXyi4go-xKSN0k_kh_NoZePEDlRYRt-0vuA40InwCBcdN_WA'



const oauth2Client = new google.auth.OAuth2(Client_id, Client_secret, redirect_uris);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

oauth2Client.setCredentials({refresh_token:refresh_token});

const drive = google.drive({version: 'v3', auth: oauth2Client});

const filePath = path.join(__dirname, 'test_file.png');


const folderName = 'Main Project Folder';
const main_folder_id = '1_6pjUXAfO0p7Vem2DG-eYsmdV7FKmTfv';



async function createRootFolderIfNotExist() {
    try {
        const response = await drive.files.list({
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)'
        });

        if (response.data.files.length > 0) {
            console.log('Root folder already exists:', response.data.files[0]);
            return response.data.files[0].id;
        } else {
            const folderResponse = await drive.files.create({
                requestBody: {
                    name: folderName, 
                    mimeType: 'application/vnd.google-apps.folder' 
                }
            });

            console.log(`${folderName} created Now:`, folderResponse.data);
            return folderResponse.data.id;
        }
    } catch (error) {
        console.error('Error checking or creating the folder:', error);
    }
}

async function createFolder(folder_name) {
    try {
        const folderResponse = await drive.files.create({
            requestBody: {
                name: folder_name, 
                mimeType: 'application/vnd.google-apps.folder',
                parents: [main_folder_id]  
            }
        });
        console.log('Folder created:', folderResponse.data);
        return folderResponse.data;
    } catch (error) {
        console.error('Error creating folder:', error);
    }
}

async function uploadFileToFolder(folderId, file_path, file_name, file_type) {
    try {
        const uploadResponse = await drive.files.create({
            requestBody: {
                name: file_name, // File name in Google Drive
                mimeType: file_type, // File MIME type
                parents: [folderId], // Target folder ID in Google Drive
            },
            media: {
                mimeType: file_type,
                body: fs.createReadStream(file_path), // Stream the file for upload
            },
        });

        console.log('File uploaded:', uploadResponse.data);
        return {
            success: true,
            file_id: uploadResponse.data.id,
            file_name: uploadResponse.data.name,
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file to Google Drive');
    }
}


async function get_files_from_folder(folderId) {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, createdTime)'
        });

        const files = response.data.files;

        if (files.length > 0) {
            console.log(`Files in folder (ID: ${folderId}):`);
            files.forEach(file => {
                console.log(`ID: ${file.id}, Name: ${file.name}, Type: ${file.mimeType}, Upload Date: ${file.createdTime}`);
            });

            // Simply return the files array
            return files;
        } else {
            console.log('No files found in the folder.');
            return [];
        }
    } catch (error) {
        console.error('Error retrieving files from folder:', error);
        throw error;
    }
}


module.exports = {createRootFolderIfNotExist,createFolder,uploadFileToFolder,get_files_from_folder};

// uploadFileToFolder('1hOHDMIwFGJYGvyZ8wzWkDlzNsdHMCWGm');
