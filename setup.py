import os, time
from setuptools import find_packages, setup
from pip.req import parse_requirements

def get_requirements(filename):
    reqs = parse_requirements(filename)
    return [str(r.req) for r in reqs]

def get_install_requires():
    return get_requirements('requirements.txt')

def get_test_requires():
    return get_requirements('requirements_dev.txt')

setup_args = dict(
    name='pies',
    version='0.0.3',
    packages=find_packages(),
    namespace_packages=['pies'],
    install_requires=get_install_requires(),
    tests_require=get_test_requires(),
    entry_points={
        'console_scripts': [
            'pies-test=pies.util:say_hello'
        ]
    }
)

if __name__ == '__main__':
    if os.environ.get('EAT_PIES_SLOWLY'):
        len = float(os.getenv('EAT_PIES_SLOWLY', 10))
        print "Going to have a nice little nap for {0} seconds".format(len)
        time.sleep(len)

    setup(**setup_args)
