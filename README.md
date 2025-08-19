# gdoc-pdf-url
Google Doc to PDF to static URL Script

>[!Note]
>Google Docs hsa a "Publish to Web" feature built-in which achieves the same result with a lot less work. I'm leaving the code for this up because it might still be useful to someone for a reason I haven't considered.

This tool is useful for a situation where you have a Google Doc that you update often, that you want to host online as a PDF. Typically, that requires creating a PDF version manually in Google Drive, changing the format using the ID to point to the desired variant (ie /preview or /view or /download), then updating a shortlink or your host URL to point to the new PDF URL. It gets even more complicated when you want both an embedded PDF and a download link, which requires a user to repeat part of that process twice.

This tool automates that process entirely. It creates a new menu in your Google Doc. When you click "Update PDF" in that menu, the script automatically creates the PDF and updates shortURLs for both embedding and downloading that PDF. That way, you can just embed your short URLs on your hosting site or wherever they are shared online, and they will automatically update to point to your newest document version.

Short.io was used for their generous free tier. Other url shortening services such as bit.ly or tinyurl offer similar features, but they don't allow you to update your url's destination for free via API. I would highly suggest using Short.io, though you can adapt this code as needed if you choose to use a different service.

Example use cases: 
- You have a portfolio on the web and want to keep it in sync with your resume.
- You manage a school club that wants to keep a permanent link to their published club constitution.
- A studio wants the interns to be able to update a published schedule without editing web content directly.
- Anything else you can dream of!

## Instructions:

### Step 1: Setting up our Files
- In your Google Doc, mouse over _Extensions_ and click _Apps Script_.
- Delete the template code in **Code.gs**
- Copy-paste the contents of my **Code.gs** into your **Code.gs**
- Create a new Google Drive folder for storing your pdf. Copy the string of letters and numbers after the / and put them into `pdfFolderId` in **Code.gs**.
- Go back to the Google Doc. Copy the string of letters and numbers in the URL after the / and put it into `docId` in **Code.gs**.

### Step 2: Setting Up Short.io
- Go to short.io and set up an account.
- The dashboard that opens will say "Current domain" on the left bar. Copy that URL and paste it into `shortIoDomain` in **Code.gs**
- In the left bar, go to _Integrations & API_
- Click _Create API Key_. Leave _Public key_ unchecked. Make up a name for this key, then click _Create_.
- Copy the key that appears. It will only appear once. Paste it into `shortIoApiToken` in **Code.gs**.
- Create `shortIoAliasPreview` and `shortIoAliasDownload` in **Code.gs**. You can just make these up as you see fit - they will be the end of your url (ie fywl.short.gy/**cute-kittens**)
- Press Control-S or use the floppy disk icon to save **Code.gs**.
- In the dropdown menu at the top of **Code.gs**, select `UpdatePDF` and click _Run_.
- You will be prompted to allow the script permission to access, modify, and delete your documents. It is safe to allow this script to access your documents.
- The script will run.
- At the bottom of your screen, two URLs will be displayed. Those are your "permanent" access URLs. Test them, then add them to your website.

### Step 3: 

- Each time you want to "push" your changes from your Google Doc to your website, you will need to open your Google Doc, click on _Custom PDF Menu_, and click _Update PDF_.
- You can set up a trigger to update the document once per day or once per week automatically, and the website's PDFs will always stay up to date.
> [!NOTE]
> The script creates a NEW PDF every time it is run, and moves the old PDF to the trash. The trash does take up space in your Google Drive account. If you were to run this every minute, you may completely fill your Google Drive with trashed PDFs. Don't do this.

Enjoy!
