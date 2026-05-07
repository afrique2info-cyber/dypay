from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="dypay",
    version="1.0.0",
    author="Dypay",
    author_email="support@dypay.com",
    description="SDK Python officiel pour intégrer Dypay dans vos applications",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/dypay/dypay-python",
    py_modules=["dypay"],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.7",
    install_requires=[
        "requests>=2.28.0",
    ],
    keywords="dypay payment mobile-money africa cameroon senegal payment-gateway",
    project_urls={
        "Bug Reports": "https://github.com/dypay/dypay-python/issues",
        "Source": "https://github.com/dypay/dypay-python",
        "Documentation": "https://docs.dypay.com",
    },
)
