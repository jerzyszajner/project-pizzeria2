#!/bin/bash
# Clean Start
# Use the `cleanstart` script to start the server. This script ensures that the server port is free before starting,
# avoiding "port already in use" errors. Run it using:
# npm run cleanstart

PORT=3131
# Uses lsof to find the PID of the process using the port
PID=$(lsof -t -i:$PORT)

# Checks if a PID was found
if [ ! -z "$PID" ]; then
  echo "Attempting to close process on port $PORT gracefully..."
  # Sends SIGTERM signal, asking the process to close
  kill -15 $PID  
  sleep 5  # Waits for 5 seconds

  # Checks if the process is still running
  if kill -0 $PID 2>/dev/null; then
    echo "Process did not terminate, forcing closure..."
    # Sends SIGKILL signal, immediately terminating the process
    kill -9 $PID  
  else
    echo "Process terminated successfully."
  fi
fi

echo "Starting server..."
npm run watch  # Starts the Node.js server using npm