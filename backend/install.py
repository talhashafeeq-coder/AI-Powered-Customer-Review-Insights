#!/usr/bin/env python3
"""
Installation script for the AI-Powered Customer Review Insights API
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    try:
        print("Installing required packages...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing packages: {e}")
        return False

def create_env_file():
    """Create .env file from example"""
    if not os.path.exists(".env"):
        if os.path.exists("env.example"):
            print("Creating .env file from example...")
            with open("env.example", "r") as src:
                with open(".env", "w") as dst:
                    dst.write(src.read())
            print("✅ .env file created! Please update it with your configuration.")
        else:
            print("⚠️  No env.example file found. Please create .env manually.")
    else:
        print("✅ .env file already exists.")

def main():
    """Main installation function"""
    print("🚀 Setting up AI-Powered Customer Review Insights API...")
    print("=" * 60)
    
    # Install requirements
    if not install_requirements():
        print("❌ Installation failed!")
        return False
    
    # Create .env file
    create_env_file()
    
    print("=" * 60)
    print("✅ Installation completed!")
    print("\nNext steps:")
    print("1. Update the .env file with your configuration")
    print("2. Start MongoDB (if not using Docker)")
    print("3. Run: python run.py")
    print("\nFor Docker setup:")
    print("1. Run: docker-compose up -d")
    
    return True

if __name__ == "__main__":
    main()








