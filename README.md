## Пробую створити WEB-логер силами ChatGPT. Просто цікаво.

```
# Develop a WEB Application

A WEB application needs to be developed using PWA technology, HTML5, and NodeJS.

The application must work in Offline mode.

The application should provide the ability to open a COM port.
Utilize the Web USB API for this purpose. Add usb rule filter for vendor id=0x2fe3, product id=0x0001.
Open the COM port with the settings 115200, 8N1, without flow control.

The data received from the COM port should be split into lines. For each line, add a timestamp at the beginning and a value in seconds relative to the time of the previous line with millisecond precision.

Display the received data on the screen.

Implement the ability to download the received log into a text file.

Create a button to connect to the COM port. Create a button to clear the log.

Design should be minimalistic. Full-screen display. Adapted for use on mobile phones. Buttons fixed at the top of the screen.

Use npx and npm for project creation.
```